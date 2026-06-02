import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router'
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material'
import { getQuoteById } from '../config'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa',
    },
    secondary: {
      main: '#f4b557',
    },
  },
})

const termLabels: Record<iQuote['termLength'], string> = {
  MONTHLY: 'Monthly',
  ANNUAL: 'Annual',
  TWO_YEAR: 'Two-Year',
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)

const QuoteById = () => {
  const { id } = useParams<{ id: string }>()
  const [copied, setCopied] = useState(false)
  const [quote, setQuote] = useState<Partial<iQuote>>({});

  const handleCopyQuoteLink = async () => {
    const url = `${window.location.origin}/quote/${quote?._id ?? ""}`

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = url
        textArea.style.position = 'fixed'
        textArea.style.left = '0'
        textArea.style.top = '0'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }

      setCopied(true)
      window.setTimeout(() => setCopied(false), 500)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  async function getQuoteData() {
    try{
      const { data } = await getQuoteById(id as string);
      const { success, quote } = data as { success:boolean, quote:iQuote }
      if(success){
        setQuote(quote);
      }
    }catch(error:any){
      console.log(error.message || error.response.data.message);
    }finally{
    }
  }

  useEffect(()=>{
    getQuoteData();
  },[])

  return (
    <ThemeProvider theme={darkTheme}>
      <Box className="min-h-screen bg-slate-950 text-slate-100 py-10">
        <Container maxWidth="lg">
          <Stack spacing={6}>
            <Box className="rounded-4xl border border-slate-800 bg-slate-900/90 p-6 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.9)] backdrop-blur-xl">
              <Box className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <Typography variant="overline" className="text-sky-300" gutterBottom>
                    Quote preview
                  </Typography>
                  <Typography variant="h4" className="font-semibold text-white">
                    {quote.name}
                  </Typography>
                  <Typography className="text-slate-400">
                    {quote.customerName} • {termLabels[(quote?.termLength || "MONTHLY")]} term • {quote.status}
                  </Typography>
                </div>
              </Box>
              <Divider className="my-6 border-slate-800" />
              <div className="grid gap-4 md:grid-cols-[1fr_1.5fr]">
                <div>
                  <Card className="rounded-3xl bg-slate-900/95 border border-slate-800 shadow-xl shadow-slate-950/20">
                    <CardContent>
                      <Typography variant="subtitle2" className="text-slate-400 uppercase tracking-[0.3em]">
                        Quote details
                      </Typography>
                      <Stack spacing={2} className="mt-4">
                        <div>
                          <Typography className="text-slate-300">Quote ID</Typography>
                          <Typography className="text-white font-medium">{quote._id}</Typography>
                        </div>
                        <div>
                          <Typography className="text-slate-300">Share token</Typography>
                          <Typography className="text-white font-medium break-all">{quote.shareToken}</Typography>
                        </div>
                        <div>
                          <Typography className="text-slate-300">Quote Date</Typography>
                          <Typography className="text-white font-medium">
                            {new Date(quote?.createdAt as string).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </Typography>
                        </div>
                        <div>
                          <Typography className="text-slate-300">Valid  Until</Typography>
                          <Typography className="text-white font-medium">
                            {(() => {
                              const expiryDate = new Date(quote?.expiryDate as string);
                              
                              return expiryDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              });
                            })()}
                          </Typography>
                        </div>
                      </Stack>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl shadow-slate-950/20">
                    <CardContent>
                      <Typography variant="subtitle2" className="text-slate-400 uppercase tracking-[0.3em]">
                        Product summary
                      </Typography>
                      <div className="grid gap-3 mt-4 md:grid-cols-2">
                        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                          <Typography className="text-slate-300">Product</Typography>
                          <Typography className="text-white font-semibold mt-2">{quote.productName}</Typography>
                        </div>
                        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                          <Typography className="text-slate-300">Tier</Typography>
                          <Typography className="text-white font-semibold mt-2">{quote.tierName}</Typography>
                        </div>
                        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                          <Typography className="text-slate-300">Base seats</Typography>
                          <Typography className="text-white font-semibold mt-2">{quote.baseSeats}</Typography>
                        </div>
                        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                          <Typography className="text-slate-300">Term</Typography>
                          <Typography className="text-white font-semibold mt-2">{termLabels[quote?.termLength || "MONTHLY"]}</Typography>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Box>

            <Card className="rounded-4xl border border-slate-800 bg-slate-900/95 shadow-[0_28px_70px_-32px_rgba(15,23,42,0.9)]">
              <CardContent>
                <Box className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <Typography variant="h6" className="text-white font-semibold">
                      Line items
                    </Typography>
                    <Typography className="text-slate-500">Review the base product and any selected add-ons.</Typography>
                  </div>
                </Box>

                <TableContainer className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/90">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell className="text-slate-400 font-medium">Item</TableCell>
                        <TableCell className="text-slate-400 font-medium">Model</TableCell>
                        <TableCell className="text-slate-400 font-medium">Qty</TableCell>
                        <TableCell className="text-slate-400 font-medium">Term</TableCell>
                        <TableCell className="text-slate-400 font-medium">Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(quote?.lineItems || []).map((item) => (
                        <TableRow key={item.name} className="border-t border-slate-800">
                          <TableCell className="text-slate-100 py-4">
                            <div className="text-sm font-semibold">{item.name}</div>
                            <div className="text-slate-500 text-xs">{item.notes}</div>
                          </TableCell>
                          <TableCell className="text-slate-200">{item.pricingModel.replace('_', ' ')}</TableCell>
                          <TableCell className="text-slate-200">{item.quantity ?? 1}</TableCell>
                          <TableCell className="text-slate-200">{item.termMonths} mo</TableCell>
                          <TableCell className="text-white font-semibold">{formatCurrency(item.subtotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
              <div>
                <Card className="rounded-4xl border border-slate-800 bg-slate-900/90 shadow-xl shadow-slate-950/20">
                  <CardContent>
                    <Typography variant="h6" className="text-white font-semibold mb-4">
                      Discounts & notes
                    </Typography>
                    <Stack spacing={3}>
                      <Box className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                        <Typography className="text-slate-300">Custom discount</Typography>
                        <Typography className="text-white font-semibold mt-2">{quote.customDiscountPercent}%</Typography>
                        <Typography className="text-slate-500 text-sm mt-1">This percentage is applied to the gross total after add-ons.</Typography>
                      </Box>
                      <Box className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
                        <Typography className="text-slate-300">Calculation example</Typography>
                        <Typography className="text-white font-medium mt-2">
                          {quote?.lineItems?.[0]?.calculation}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="rounded-4xl border border-slate-800 bg-slate-900/95 shadow-xl shadow-slate-950/20">
                  <CardContent>
                    <Typography variant="h6" className="text-white font-semibold mb-4">
                      Financial summary
                    </Typography>
                    <Stack spacing={3}>
                      <Box className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Gross total</span>
                          <span>{formatCurrency(quote?.financials?.grossTotal || 0)}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-slate-400">
                          <span>Discount</span>
                          <span>-{formatCurrency(quote?.financials?.discountAmount || 0)}</span>
                        </div>
                        <Divider className="my-4 border-slate-800" />
                        <div className="flex items-center justify-between text-white font-semibold text-lg">
                          <span>Net total</span>
                          <span>{formatCurrency(quote?.financials?.netTotal || 0)}</span>
                        </div>
                      </Box>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        onClick={handleCopyQuoteLink}
                        disabled={copied}
                      >
                        {copied ? 'Copied!' : 'Share quote link'}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default QuoteById