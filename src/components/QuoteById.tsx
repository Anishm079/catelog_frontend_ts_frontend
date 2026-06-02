import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
  Card,
  CardContent,
  Chip,
  ThemeProvider,
  createTheme,
  Stack,
} from '@mui/material'
import { useFeaturesState, useProductsState } from '../stores'
import { getAllFeatures, getAllProducts } from '../config'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField, LocalizationProvider } from '@mui/x-date-pickers';
import type { PickerValue } from '@mui/x-date-pickers/internals';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

type QuoteByIdProps = {
  open: boolean
  onClose: () => void
  onSubmit: (data: iQuote) => void
  quote?: iQuote | null | undefined
}

const termDiscounts: Record<'MONTHLY' | 'ANNUAL' | 'TWO_YEAR', number> = {
  MONTHLY: 0,
  ANNUAL: 15,
  TWO_YEAR: 25,
}

const createId = () => crypto.randomUUID?.() ?? `quote-${Math.random().toString(36).slice(2, 10)}`

const QuoteById = ({ open, onClose, onSubmit, quote }: QuoteByIdProps) => {
  const features = useFeaturesState((state) => state.features)
  const setFeatures = useFeaturesState((state) => state.setFeatures)
  const products = useProductsState((state) => state.products)
  const setProducts = useProductsState((state) => state.setProducts)

  const [generatedId, setGeneratedId] = useState(createId)
  const [name, setName] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<iProduct | null>(null)
  const [selectedTier, setSelectedTier] = useState<iTier | null>(null)
  const [baseSeats, setBaseSeats] = useState(1)
  const [termLength, setTermLength] = useState<'MONTHLY' | 'ANNUAL' | 'TWO_YEAR'>('ANNUAL')
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, { quantity?: number; applied: boolean }>>({})
  const [customDiscountPercent, setCustomDiscountPercent] = useState(0)
  const [expityDate, setExpityDate] = useState<PickerValue | undefined>(undefined);

  const tierAddOns = useMemo(() => {
    if (!selectedTier?.features) return []
    return selectedTier.features.filter((f) => f.availability === 'ADD_ON')
  }, [selectedTier])

  const termDiscount = termDiscounts[termLength]

  const calculateFinancials = useMemo(() => {
    if (!selectedProduct || !selectedTier) {
      return { grossTotal: 0, discountAmount: 0, netTotal: 0 }
    }

    let grossTotal = 0

    // Base product calculation
    const basePrice = selectedTier.basePricePerSeat * baseSeats * (termLength === 'MONTHLY' ? 1 : termLength === 'ANNUAL' ? 12 : 24)
    const basePriceAfterDiscount = basePrice * ((100 - termDiscount) / 100)
    grossTotal += basePriceAfterDiscount

    // Add-ons calculation
    for (const addOn of tierAddOns) {
      if (selectedAddOns[addOn.featureId]?.applied && addOn.pricing) {
        let addOnPrice = 0

        const addOnQuantity = selectedAddOns[addOn.featureId]?.quantity || 1
        if (addOn.pricing.model === 'FIXED') {
          addOnPrice = addOn.pricing.value
        } else if (addOn.pricing.model === 'PER_SEAT') {
          addOnPrice = addOn.pricing.value * addOnQuantity * (termLength === 'MONTHLY' ? 1 : termLength === 'ANNUAL' ? 12 : 24)
        } else if (addOn.pricing.model === 'PERCENTAGE') {
          addOnPrice = (basePriceAfterDiscount * addOn.pricing.value) / 100
        }

        grossTotal += addOnPrice
      }
    }

    // Custom discount
    const discountAmount = (grossTotal * customDiscountPercent) / 100
    const netTotal = grossTotal - discountAmount

    return {
      grossTotal: Math.round(grossTotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      netTotal: Math.round(netTotal * 100) / 100,
    }
  }, [selectedProduct, selectedTier, baseSeats, termLength, customDiscountPercent, selectedAddOns, tierAddOns])

  useEffect(() => {
    if (!open) return

    setGeneratedId(createId())
    setName(quote?.name ?? '')
    setCustomerName(quote?.customerName ?? '')
    setSelectedProduct(null)
    setSelectedTier(null)
    setBaseSeats(quote?.baseSeats ?? 1)
    setTermLength(quote?.termLength ?? 'ANNUAL')
    setSelectedAddOns({})
    setCustomDiscountPercent(quote?.customDiscountPercent ?? 0)
  }, [open, quote])

  useEffect(() => {
    if (!open) return

    const fetchData = async () => {
      try {
        if (products.length === 0) {
          const { data } = await getAllProducts()
          if (data?.success && Array.isArray(data.products)) {
            setProducts(data.products)
          }
        }

        if (features.length === 0) {
          const { data } = await getAllFeatures()
          if (data?.success && Array.isArray(data.features)) {
            setFeatures(data.features)
          }
        }
      } catch (error) {
        console.error('Unable to load data for quotes', error)
      }
    }

    fetchData()
  }, [open, products.length, features.length, setProducts, setFeatures])

  const toggleAddOn = (featureId: string) => {
    setSelectedAddOns((current) => ({
      ...current,
      [featureId]: {
        ...current[featureId],
        applied: !current[featureId]?.applied,
        quantity: current[featureId]?.quantity || 1,
      },
    }))
  }

  const updateAddOnQuantity = (featureId: string, quantity: number) => {
    setSelectedAddOns((current) => ({
      ...current,
      [featureId]: {
        ...current[featureId],
        quantity,
        applied: current[featureId]?.applied ?? false,
      },
    }))
  }

  const validate = (): string | null => {
    if (!name.trim()) return 'Quote name is required.'
    if (!customerName.trim()) return 'Customer name is required.'
    if (!selectedProduct) return 'Please select a product.'
    if (!selectedTier) return 'Please select a tier.'
    if (baseSeats < 1) return 'Base seats must be at least 1.'
    return null
  }

  const handleSubmit = () => {
    const validationError = validate()
    if (validationError) {
      alert(validationError)
      return
    }

    const baseTermMonths = termLength === 'MONTHLY' ? 1 : termLength === 'ANNUAL' ? 12 : 24
    const baseSubtotal = selectedTier!.basePricePerSeat * baseSeats * baseTermMonths * ((100 - termDiscount) / 100)

    const lineItems: QuoteLineItem[] = [
      {
        name: `${selectedProduct!.name} - ${selectedTier!.name} Base`,
        type: 'BASE_PRODUCT',
        pricingModel: 'PER_SEAT',
        unitPrice: selectedTier!.basePricePerSeat,
        quantity: baseSeats,
        termMonths: baseTermMonths,
        termDiscountPercent: termDiscount,
        calculation: `${baseSeats} seats × $${selectedTier!.basePricePerSeat} per seat × ${baseTermMonths} months × ${(100 - termDiscount) / 100}`,
        notes: 'Base product cost after term discount',
        subtotal: baseSubtotal,
      },
    ]

    // Add selected add-ons to line items
    for (const addOn of tierAddOns) {
      if (selectedAddOns[addOn.featureId]?.applied && addOn.pricing) {
        const feature = features.find((f) => f._id === addOn.featureId)
        const quantity = selectedAddOns[addOn.featureId]?.quantity || 1
        let subtotal = 0

            if (addOn.pricing.model === 'FIXED') {
          subtotal = addOn.pricing.value
        } else if (addOn.pricing.model === 'PER_SEAT') {
          subtotal = addOn.pricing.value * quantity * baseTermMonths
        } else if (addOn.pricing.model === 'PERCENTAGE') {
          subtotal = (lineItems[0].subtotal * addOn.pricing.value) / 100
        }

        lineItems.push({
          featureId: addOn.featureId,
          name: feature?.name || 'Unknown Add-on',
          type: 'ADD_ON',
          pricingModel: addOn.pricing.model,
          unitPrice: addOn.pricing.value,
          quantity: addOn.pricing.model === 'PER_SEAT' ? quantity : undefined,
          termMonths: baseTermMonths,
          calculation:
            addOn.pricing.model === 'FIXED'
              ? `$${addOn.pricing.value} fixed`
              : addOn.pricing.model === 'PER_SEAT'
                ? `${quantity} seats × $${addOn.pricing.value} per seat × ${baseTermMonths} months`
                : `${addOn.pricing.value}% of base product (${lineItems[0].subtotal.toFixed(2)})`,
          notes: addOn.pricing.model === 'PERCENTAGE' ? 'Percentage of base product after term discount' : 'Add-on cost',
          subtotal,
        })
      }
    }

    const payload: iQuote = {
      _id: quote?._id ?? generatedId,
      name: name.trim(),
      customerName: customerName.trim(),
      expiryDate: expityDate?.toISOString() ?? new Date().toISOString(),
      shareToken: quote?.shareToken ?? '',
      productId: selectedProduct!._id,
      productName: selectedProduct!.name,
      tierName: selectedTier!.name,
      baseSeats,
      termLength,
      lineItems,
      customDiscountPercent,
      financials: calculateFinancials,
      status: quote?.status ?? 'DRAFT',
      createdAt: quote?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: quote?.__v ?? 0,
    }

    onSubmit(payload)
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog maxWidth="lg" fullWidth open={open} onClose={onClose}>
        <DialogTitle>{quote?._id ? 'Edit' : 'Create'} Quote</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2, pb: 2 }}>
          {/* Step 1: Quote Name and Customer */}
          <TextField label="Quote Name" value={name} onChange={(e) => setName(e.target.value)} variant="filled" fullWidth />
          <TextField label="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} variant="filled" fullWidth />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <DateField label="Expiry Date" value={expityDate} onChange={setExpityDate} disablePast />
                </Box>
          </LocalizationProvider>
          {/* Step 2 & 3: Product & Tier Selection */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Autocomplete
              options={products}
              getOptionLabel={(option) => option.name}
              value={selectedProduct}
              onChange={(_, newValue) => {
                setSelectedProduct(newValue)
                setSelectedTier(null)
              }}
              renderInput={(params) => <TextField {...params} label="Select Product" variant="filled" />}
              sx={{ flex: 1 }}
            />
            <Autocomplete
              options={selectedProduct?.tiers ?? []}
              getOptionLabel={(option) => option.name}
              value={selectedTier}
              onChange={(_, newValue) => setSelectedTier(newValue)}
              disabled={!selectedProduct}
              renderInput={(params) => <TextField {...params} label="Select Tier" variant="filled" />}
              sx={{ flex: 1 }}
            />
          </Box>

          {selectedProduct && selectedTier && (
            <>
              {/* Step 4: Base Seats */}
              <TextField label="Base Seats" type="number" value={baseSeats} onChange={(e) => setBaseSeats(Number(e.target.value))} variant="filled" fullWidth />

              {/* Step 5: Term Length with Discount Info */}
              <TextField
                select
                label="Term Length"
                value={termLength}
                onChange={(e) => setTermLength(e.target.value as 'MONTHLY' | 'ANNUAL' | 'TWO_YEAR')}
                variant="filled"
                fullWidth
              >
                <MenuItem value="MONTHLY">Monthly (0% discount)</MenuItem>
                <MenuItem value="ANNUAL">Annual (15% discount)</MenuItem>
                <MenuItem value="TWO_YEAR">Two-Year (25% discount)</MenuItem>
              </TextField>

              {/* Step 6: Add-ons Selection */}
              {tierAddOns.length > 0 && (
                <Box>
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>Available Add-ons</Typography>
                  <Stack spacing={2}>
                    {tierAddOns.map((addOn) => {
                      const feature = features.find((f) => f._id === addOn.featureId)
                      const isSelected = selectedAddOns[addOn.featureId]?.applied

                      return (
                        <Card key={addOn.featureId} variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                              <Typography sx={{ fontWeight: 600 }}>{feature?.name}</Typography>
                              <Chip
                                label={isSelected ? 'Selected' : 'Add'}
                                onClick={() => toggleAddOn(addOn.featureId)}
                                color={isSelected ? 'primary' : 'default'}
                                variant={isSelected ? 'filled' : 'outlined'}
                              />
                            </Box>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                              {feature?.description}
                            </Typography>

                            {isSelected && addOn.pricing && (
                              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <Typography variant="body2">
                                  {addOn.pricing.model === 'FIXED'
                                    ? `$${addOn.pricing.value} fixed`
                                    : addOn.pricing.model === 'PER_SEAT'
                                      ? `$${addOn.pricing.value} per seat`
                                      : `${addOn.pricing.value}% of base`}
                                </Typography>

                                {addOn.pricing.model === 'PER_SEAT' && (
                                  <TextField
                                    label="Quantity"
                                    type="number"
                                    size="small"
                                    value={selectedAddOns[addOn.featureId]?.quantity || 1}
                                    onChange={(e) => updateAddOnQuantity(addOn.featureId, Number(e.target.value))}
                                    variant="filled"
                                    sx={{ width: 100 }}
                                  />
                                )}
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </Stack>
                </Box>
              )}

              {/* Step 7: Custom Discount */}
              <TextField label="Custom Discount (%)" type="number" value={customDiscountPercent} onChange={(e) => setCustomDiscountPercent(Number(e.target.value))} variant="filled" fullWidth />

              {/* Financial Summary */}
              <div>
                <Card variant="elevation">
                    <CardContent>
                    <Typography sx={{ fontWeight: 700, mb: 2 }}>Quote Summary</Typography>
                    <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Gross Total:</Typography>
                        <Typography>${calculateFinancials.grossTotal.toFixed(2)}</Typography>
                        </Box>
                        {customDiscountPercent > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                            <Typography>Discount ({customDiscountPercent}%):</Typography>
                            <Typography>-${calculateFinancials.discountAmount.toFixed(2)}</Typography>
                        </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography>Net Total:</Typography>
                        <Typography>${calculateFinancials.netTotal.toFixed(2)}</Typography>
                        </Box>
                    </Stack>
                    </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button onClick={handleSubmit} variant="contained">
            {quote?._id ? 'Update Quote' : 'Create Quote'}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}

export default QuoteById
