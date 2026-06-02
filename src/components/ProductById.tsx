import { useEffect, useMemo, useState } from 'react'
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
  ThemeProvider,
  createTheme,
} from '@mui/material'
import { useFeaturesState } from '../stores'
import { getAllFeatures } from '../config'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

type ProductByIdProps = {
  open: boolean
  onClose: () => void
  onSubmit: (data: iProduct, id?: string) => void
  product?: iProduct | null | undefined
}

const defaultTiers: iTier[] = [
  { name: 'Starter', basePricePerSeat: 0, features: [] },
  { name: 'Growth', basePricePerSeat: 0, features: [] },
  { name: 'Enterprise', basePricePerSeat: 0, features: [] },
]

const availabilityOptions: Array<{ value: iTierFeature['availability']; label: string }> = [
  { value: 'INCLUDED', label: 'Included' },
  { value: 'ADD_ON', label: 'Paid add-on' },
  { value: 'NOT_AVAILABLE', label: 'Not available' },
]

const pricingOptions: Array<{ value: 'FIXED' | 'PER_SEAT' | 'PERCENTAGE'; label: string }> = [
  { value: 'FIXED', label: 'Fixed monthly price' },
  { value: 'PER_SEAT', label: 'Per seat price' },
  { value: 'PERCENTAGE', label: 'Percentage of product price' },
]

const createId = () => crypto.randomUUID?.() ?? `product-${Math.random().toString(36).slice(2, 10)}`

const ProductById = ({ open, onClose, onSubmit, product }: ProductByIdProps) => {
  const features = useFeaturesState((state) => state.features)
  const setFeatures = useFeaturesState((state) => state.setFeatures)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [generatedId, setGeneratedId] = useState(createId)
  const [tiers, setTiers] = useState<iTier[]>([])
  const [featureToAddByTier, setFeatureToAddByTier] = useState<Record<number, iFeature | null>>({})
  const [loadingFeatures, setLoadingFeatures] = useState(false)

  const selectedFeatureIds = useMemo(
    () =>
      Array.from(
        new Set(
          tiers.flatMap((tier) => (tier.features ?? []).map((feature) => feature.featureId)),
        ),
      ),
    [tiers],
  )

  const normalizeTier = (tier: iTier): iTier => {
    const existingFeatures = tier.features ?? []

    return {
      name: tier.name || '',
      basePricePerSeat: tier.basePricePerSeat ?? 0,
      features: existingFeatures,
    }
  }

  const initialTiers = useMemo(() => {
    const source = product?.tiers?.length ? product.tiers : defaultTiers
    return source.map(normalizeTier)
  }, [product, features.length])

  useEffect(() => {
    if (!open) return

    setGeneratedId(createId())
    setName(product?.name ?? '')
    setDescription(product?.description ?? '')
    setTiers(initialTiers)
  }, [open, initialTiers, product])

  useEffect(() => {
    if (!open) return
    setTiers((current) => current.map(normalizeTier))
  }, [features.length, open])

  useEffect(() => {
    if (!open || features.length > 0) return

    const fetchFeatures = async () => {
      setLoadingFeatures(true)
      try {
        const { data } = await getAllFeatures()
        if (data?.success && Array.isArray(data.features)) {
          setFeatures(data.features)
        }
      } catch (error) {
        console.error('Unable to load features for products', error)
      } finally {
        setLoadingFeatures(false)
      }
    }

    fetchFeatures()
  }, [open, features.length, setFeatures])

  const handleTierChange = (index: number, field: 'name' | 'basePricePerSeat', value: string | number) => {
    setTiers((current) =>
      current.map((tier, tierIndex) =>
        tierIndex !== index
          ? tier
          : {
              ...tier,
              [field]: field === 'basePricePerSeat' ? Number(value) : String(value),
            },
      ),
    )
  }

  const handleFeatureAvailabilityChange = (
    tierIndex: number,
    featureId: string,
    availability: iTierFeature['availability'],
  ) => {
    setTiers((current) =>
      current.map((tier, index) => {
        if (index !== tierIndex) return tier

        return {
          ...tier,
          features: (tier.features ?? []).map((item) =>
            item.featureId !== featureId
              ? item
              : {
                  ...item,
                  availability,
                  pricing: availability === 'ADD_ON' ? item.pricing ?? { model: 'FIXED', value: 0 } : undefined,
                },
          ),
        }
      }),
    )
  }

  const handleFeaturePricingChange = (
    tierIndex: number,
    featureId: string,
    model: 'FIXED' | 'PER_SEAT' | 'PERCENTAGE',
  ) => {
    setTiers((current) =>
      current.map((tier, index) => {
        if (index !== tierIndex) return tier
        return {
          ...tier,
          features: (tier.features ?? []).map((item) =>
            item.featureId !== featureId
              ? item
              : {
                  ...item,
                  pricing: item.pricing ? { ...item.pricing, model } : undefined,
                },
          ),
        }
      }),
    )
  }

  const handleFeaturePriceChange = (tierIndex: number, featureId: string, value: number) => {
    setTiers((current) =>
      current.map((tier, index) => {
        if (index !== tierIndex) return tier
        return {
          ...tier,
          features: (tier.features ?? []).map((item) =>
            item.featureId !== featureId
              ? item
              : {
                  ...item,
                  pricing: item.pricing ? { ...item.pricing, value } : undefined,
                },
          ),
        }
      }),
    )
  }

  const addFeature = (tierIndex: number) => {
    const featureToAdd = featureToAddByTier[tierIndex]
    if (!featureToAdd) return

    setTiers((current) =>
      current.map((tier, index) =>
        index !== tierIndex
          ? tier
          : {
              ...tier,
              features: tier.features?.some((item) => item.featureId === featureToAdd._id)
                ? tier.features
                : [
                    ...(tier.features ?? []),
                    {
                      featureId: featureToAdd._id,
                      availability: 'NOT_AVAILABLE',
                    },
                  ],
            },
      ),
    )
    setFeatureToAddByTier((current) => ({ ...current, [tierIndex]: null }))
  }

  const removeFeature = (tierIndex: number, featureId: string) => {
    setTiers((current) =>
      current.map((tier, index) =>
        index !== tierIndex
          ? tier
          : {
              ...tier,
              features: (tier.features ?? []).filter((item) => item.featureId !== featureId),
            },
      ),
    )
  }

  const addTier = () => {
    setTiers((current) => [...current, normalizeTier({ name: '', basePricePerSeat: 0, features: [] })])
  }

  const removeTier = (index: number) => {
    setTiers((current) => current.filter((_, tierIndex) => tierIndex !== index))
  }

  const validate = (): string | null => {
    if (!name.trim()) return 'Product name is required.'
    if (!selectedFeatureIds.length) return 'Please add at least one feature to the product.'
    if (!tiers.length) return 'Please add at least one tier.'

    for (const [tierIndex, tier] of tiers.entries()) {
      if (!tier.name.trim()) {
        return `Tier ${tierIndex + 1} needs a name.`
      }

      for (const row of tier.features ?? []) {
        if (row.availability === 'ADD_ON' && (!row.pricing || row.pricing.value === undefined || row.pricing.value < 0)) {
          return `Tier "${tier.name}" has an add-on feature that needs a valid price and pricing model.`
        }
      }
    }

    return null
  }

  const handleSubmit = () => {
    const validationError = validate()
    if (validationError) {
      alert(validationError)
      return
    }

    const payload: iProduct = {
      _id: product?._id ?? generatedId,
      name: name.trim(),
      description: description.trim(),
      tiers,
      createdAt: product?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: product?.__v ?? 0,
    }

    if (product?._id) {
      onSubmit(payload, product._id)
    } else {
      onSubmit(payload)
    }
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Dialog maxWidth="lg" fullWidth open={open} onClose={onClose}>
        <DialogTitle>{product?._id ? 'Edit' : 'Create'} Product</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <TextField
              label="Product Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              variant="filled"
              fullWidth
            />
            <TextField
              label="Product Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              variant="filled"
              fullWidth
            />
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              Tiers and feature availability
            </Typography>
            <Typography sx={{ mb: 2 }} variant="body2">
              Set up product tiers, base per-seat pricing, and how each feature appears for each tier.
            </Typography>

            {tiers.map((tier, tierIndex) => (
              <Box
                key={`tier-${tierIndex}`}
                sx={{
                  border: '5px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 2, mb: 2 }}>
                  <TextField
                    label="Tier Name"
                    value={tier.name}
                    onChange={(event) => handleTierChange(tierIndex, 'name', event.target.value)}
                    variant="filled"
                    fullWidth
                  />
                  <TextField
                    label="Base price per seat"
                    type="number"
                    value={tier.basePricePerSeat}
                    onChange={(event) => handleTierChange(tierIndex, 'basePricePerSeat', Number(event.target.value))}
                    variant="filled"
                    fullWidth
                  />
                  {tiers.length > 1 ? (
                    <Button color="error" onClick={() => removeTier(tierIndex)}>
                      Remove tier
                    </Button>
                  ) : null}
                </Box>

                {loadingFeatures ? (
                  <Typography>Loading available features…</Typography>
                ) : features.length === 0 ? (
                  <Typography>
                    No features are defined yet. Add features in the Features section, then assign them to tiers here.
                  </Typography>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2, alignItems: 'center' }}>
                      <Autocomplete
                        options={features.filter(
                          (feature) => !(tier.features ?? []).some((item) => item.featureId === feature._id),
                        )}
                        getOptionLabel={(option) => option.name}
                        value={featureToAddByTier[tierIndex] ?? null}
                        onChange={(_, newValue) =>
                          setFeatureToAddByTier((current) => ({ ...current, [tierIndex]: newValue }))
                        }
                        renderInput={(params) => <TextField {...params} label="Search feature to add" variant="filled" />}
                        sx={{ flex: 1 }}
                      />
                      <Button
                        variant="contained"
                        disabled={!featureToAddByTier[tierIndex]}
                        onClick={() => addFeature(tierIndex)}
                      >
                        Add feature
                      </Button>
                    </Box>

                    {(tier.features ?? []).length === 0 ? (
                      <Typography sx={{ mb: 2 }}>
                        No features have been added to this tier yet.
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'grid', gap: 2 }}>
                        {(tier.features ?? []).map((row) => {
                          const feature = features.find((item) => item._id === row.featureId)
                          if (!feature) return null

                          return (
                            <Box key={row.featureId} sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                <Typography sx={{ fontWeight: 600 }}>{feature.name}</Typography>
                                <Chip label="Assigned" size="small" />
                                <Button color="error" size="small" onClick={() => removeFeature(tierIndex, row.featureId)}>
                                  Remove
                                </Button>
                              </Box>
                              <Typography sx={{ mb: 1 }} variant="body2">
                                {feature.description}
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 2 }}>
                                <TextField
                                  select
                                  label="Availability"
                                  value={row.availability}
                                  onChange={(event) =>
                                    handleFeatureAvailabilityChange(
                                      tierIndex,
                                      row.featureId,
                                      event.target.value as iTierFeature['availability'],
                                    )
                                  }
                                  variant="filled"
                                  fullWidth
                                >
                                  {availabilityOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                                </TextField>

                                {row.availability === 'ADD_ON' ? (
                                  <>
                                    <TextField
                                      select
                                      label="Pricing model"
                                      value={row.pricing?.model ?? 'FIXED'}
                                      onChange={(event) =>
                                        handleFeaturePricingChange(
                                          tierIndex,
                                          row.featureId,
                                          event.target.value as 'FIXED' | 'PER_SEAT' | 'PERCENTAGE',
                                        )
                                      }
                                      variant="filled"
                                      fullWidth
                                    >
                                      {pricingOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                          {option.label}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                    <TextField
                                      label="Price"
                                      type="number"
                                      value={row.pricing?.value ?? ''}
                                      onChange={(event) =>
                                        handleFeaturePriceChange(tierIndex, row.featureId, Number(event.target.value))
                                      }
                                      variant="filled"
                                      fullWidth
                                    />
                                  </>
                                ) : null}
                              </Box>
                            </Box>
                          )
                        })}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            ))}

            <Button variant="outlined" onClick={addTier}>
              Add tier
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button onClick={handleSubmit} variant="contained">
            {product?._id ? 'Update Product' : 'Create Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  )
}

export default ProductById