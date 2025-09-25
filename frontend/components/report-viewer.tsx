"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface RealEstateReportData {
  property_details?: {
    property_name: string
    address: string
    unit_count: number
    rsf: number
    unit_types: Array<{
      bedrooms: number
      number_of_units: number
      unit_sf: number
      monthly_rent: number
      rent_psf: number
    }>
    offered_by: {
      company: string
      contact_person: string
      phone: string
      email: string
    }
  }
  financial_summary?: {
    units: number
    total_square_feet: number
    financials_2016_actual: {
      gross_rental_income: number
      net_operating_income: number
      vacancy_allowance: {
        amount: number
        percentage: string
      }
      operating_expenses: {
        total_calculated_opex: number
        individual_expenses: {
          property_taxes: number
          insurance: number
          maintenance: number
        }
      }
    }
    rents: Array<{
      unit_type: string
      number_of_units: number
      square_feet: number
      monthly_rent: number
      rent_per_sf: number
    }>
  }
  report_summaries?: {
    property_summary: {
      name: string
      address: string
      units: number
      total_square_feet: number
      property_type: string
    }
    financial_summary: {
      year: number
      gross_rental_income: number
      net_operating_income: number
      expenses: {
        total_operating_expenses: number
        property_taxes: number
        insurance: number
        maintenance: number
      }
    }
    market_overview: {
      radius: string
      population: {
        "2020_projection": number
        "2015_estimate": number
        growth_2015_2020: string
      }
      households: {
        owner_occupied: string
        renter_occupied: string
      }
      average_household_income_2015: number
      median_household_income_2015: number
    }
    investment_highlights: string[]
  }
  modeling_data?: {
    NOI: {
      "2016_actual": number
    }
    cap_rate: string
    opex_breakdown: {
      "2016_actual": {
        total_expenses: number
        items: Array<{
          name: string
          amount: number
          note?: string
        }>
      }
    }
  }
  debt_financing?: {
    loan_amount: number
    loan_term: number
    loan_type: string
    interest_rate: string
    WALT: string
    lease_type: string
    lender: string
    loan_to_value: string
    debt_service_coverage_ratio: string
  }
  comparables?: Array<{
    address: string
    price: number
    date_sold: string
    cap_rate: string
    occupancy: string
    rsf: number
    lot_size: string
    units: number
    price_per_unit: number
    price_per_sf: number
  }>
}

// Legacy interface for backward compatibility
interface LegacyReportData {
  id: string
  title: string
  content: string
  createdAt: string
  metadata?: {
    pages: number
    fileSize: string
    processingTime: string
  }
}

type ReportData = RealEstateReportData | LegacyReportData

interface ReportViewerProps {
  report: ReportData
}

function isLegacyReport(report: ReportData): report is LegacyReportData {
  return "id" in report && "title" in report && "content" in report
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num)
}

export function ReportViewer({ report }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "financials" | "market" | "modeling" | "comparables">(
    "overview",
  )

  if (isLegacyReport(report)) {
    return (
      <div className="h-full overflow-auto bg-background">
        <div className="container mx-auto px-6 py-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{report.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none">
                <p>{report.content}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const propertyDetails = report.property_details
  const financialSummary = report.financial_summary
  const reportSummaries = report.report_summaries
  const modelingData = report.modeling_data
  const debtFinancing = report.debt_financing
  const comparables = report.comparables

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-balance mb-2">
                {propertyDetails?.property_name ||
                  reportSummaries?.property_summary?.name ||
                  "Property Analysis Report"}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {propertyDetails?.address || reportSummaries?.property_summary?.address}
              </p>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {reportSummaries?.property_summary?.property_type || "Multifamily"}
                </Badge>
                <Badge variant="outline">
                  {propertyDetails?.unit_count || reportSummaries?.property_summary?.units} Units
                </Badge>
                <Badge variant="outline">
                  {formatNumber(propertyDetails?.rsf || reportSummaries?.property_summary?.total_square_feet || 0)} SF
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                📤 Export
              </Button>
              <Button variant="outline" size="sm">
                🔗 Share
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    financialSummary?.financials_2016_actual?.gross_rental_income ||
                      reportSummaries?.financial_summary?.gross_rental_income ||
                      0,
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Gross Rental Income</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    financialSummary?.financials_2016_actual?.net_operating_income ||
                      reportSummaries?.financial_summary?.net_operating_income ||
                      0,
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Net Operating Income</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600">
                  {financialSummary?.financials_2016_actual?.vacancy_allowance?.percentage || "3.00%"}
                </div>
                <p className="text-sm text-muted-foreground">Vacancy Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">{modelingData?.cap_rate || "TBD"}</div>
                <p className="text-sm text-muted-foreground">Cap Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            {[
              { id: "overview", label: "🏢 Overview", icon: "🏢" },
              { id: "financials", label: "💰 Financials", icon: "💰" },
              { id: "market", label: "📊 Market", icon: "📊" },
              { id: "modeling", label: "📈 Modeling", icon: "📈" },
              { id: "comparables", label: "🏘️ Comparables", icon: "🏘️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🏢</span>
                  <span>Property Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property Name:</span>
                        <span>{propertyDetails?.property_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Address:</span>
                        <span className="text-right">{propertyDetails?.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Units:</span>
                        <span>{propertyDetails?.unit_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total SF:</span>
                        <span>{formatNumber(propertyDetails?.rsf || 0)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Unit Mix</h4>
                    <div className="space-y-2">
                      {propertyDetails?.unit_types?.map((unitType, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <div>
                            <span className="font-medium">{unitType.bedrooms} BR</span>
                            <span className="text-sm text-muted-foreground ml-2">({unitType.unit_sf} SF)</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{unitType.number_of_units} units</div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(unitType.monthly_rent)}/mo
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Highlights */}
            {reportSummaries?.investment_highlights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>⭐</span>
                    <span>Investment Highlights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {reportSummaries.investment_highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Debt Financing */}
            {debtFinancing && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>🏦</span>
                    <span>Debt Financing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Loan Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Loan Amount:</span>
                          <span>{formatCurrency(debtFinancing.loan_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Interest Rate:</span>
                          <span>{debtFinancing.interest_rate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Loan Term:</span>
                          <span>{debtFinancing.loan_term} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Loan Type:</span>
                          <span>{debtFinancing.loan_type}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Loan Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">LTV:</span>
                          <span>{debtFinancing.loan_to_value}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">DSCR:</span>
                          <span>{debtFinancing.debt_service_coverage_ratio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">WALT:</span>
                          <span>{debtFinancing.WALT}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lender:</span>
                          <span>{debtFinancing.lender}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "financials" && (
          <div className="space-y-6">
            {/* Income Statement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>💰</span>
                  <span>Financial Summary (2016 Actual)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Gross Rental Income</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(financialSummary?.financials_2016_actual?.gross_rental_income || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground ml-4">
                      Less: Vacancy Allowance ({financialSummary?.financials_2016_actual?.vacancy_allowance?.percentage}
                      )
                    </span>
                    <span className="text-red-600">
                      ({formatCurrency(financialSummary?.financials_2016_actual?.vacancy_allowance?.amount || 0)})
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Effective Gross Income</span>
                    <span className="font-bold">
                      {formatCurrency(
                        (financialSummary?.financials_2016_actual?.gross_rental_income || 0) -
                          (financialSummary?.financials_2016_actual?.vacancy_allowance?.amount || 0),
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground ml-4">Less: Operating Expenses</span>
                    <span className="text-red-600">
                      (
                      {formatCurrency(
                        financialSummary?.financials_2016_actual?.operating_expenses?.total_calculated_opex || 0,
                      )}
                      )
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t-2 border-primary">
                    <span className="font-bold text-lg">Net Operating Income</span>
                    <span className="font-bold text-lg text-blue-600">
                      {formatCurrency(financialSummary?.financials_2016_actual?.net_operating_income || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rent Roll */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📋</span>
                  <span>Rent Roll</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Unit Type</th>
                        <th className="text-right py-2">Units</th>
                        <th className="text-right py-2">SF</th>
                        <th className="text-right py-2">Monthly Rent</th>
                        <th className="text-right py-2">Rent/SF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialSummary?.rents?.map((rent, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{rent.unit_type}</td>
                          <td className="text-right py-2">{rent.number_of_units}</td>
                          <td className="text-right py-2">{formatNumber(rent.square_feet)}</td>
                          <td className="text-right py-2">{formatCurrency(rent.monthly_rent)}</td>
                          <td className="text-right py-2">${rent.rent_per_sf.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "market" && reportSummaries?.market_overview && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>Market Overview ({reportSummaries.market_overview.radius})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Population Trends</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">2020 Projection:</span>
                        <span>{formatNumber(reportSummaries.market_overview.population["2020_projection"])}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">2015 Estimate:</span>
                        <span>{formatNumber(reportSummaries.market_overview.population["2015_estimate"])}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Growth (2015-2020):</span>
                        <span className="text-green-600">
                          {reportSummaries.market_overview.population["growth_2015_2020"]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Household Income</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Average Income:</span>
                        <span>{formatCurrency(reportSummaries.market_overview.average_household_income_2015)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Median Income:</span>
                        <span>{formatCurrency(reportSummaries.market_overview.median_household_income_2015)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Owner Occupied:</span>
                        <span>{reportSummaries.market_overview.households["owner_occupied"]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Renter Occupied:</span>
                        <span>{reportSummaries.market_overview.households["renter_occupied"]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "modeling" && modelingData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📈</span>
                  <span>Operating Expense Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {modelingData.opex_breakdown?.["2016_actual"]?.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        {item.note && <p className="text-sm text-muted-foreground">{item.note}</p>}
                      </div>
                      <span className="font-bold">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
                    <span className="font-bold">Total Operating Expenses</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(modelingData.opex_breakdown?.["2016_actual"]?.total_expenses || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "comparables" && comparables && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🏘️</span>
                  <span>Comparable Properties</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Address</th>
                        <th className="text-right py-3">Sale Price</th>
                        <th className="text-right py-3">Date Sold</th>
                        <th className="text-right py-3">Cap Rate</th>
                        <th className="text-right py-3">Units</th>
                        <th className="text-right py-3">Price/Unit</th>
                        <th className="text-right py-3">Price/SF</th>
                        <th className="text-right py-3">Occupancy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparables.map((comp, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-3">
                            <div>
                              <div className="font-medium">{comp.address}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatNumber(comp.rsf)} SF • {comp.lot_size}
                              </div>
                            </div>
                          </td>
                          <td className="text-right py-3 font-medium">{formatCurrency(comp.price)}</td>
                          <td className="text-right py-3">{new Date(comp.date_sold).toLocaleDateString()}</td>
                          <td className="text-right py-3">
                            <Badge variant="secondary">{comp.cap_rate}</Badge>
                          </td>
                          <td className="text-right py-3">{comp.units}</td>
                          <td className="text-right py-3">{formatCurrency(comp.price_per_unit)}</td>
                          <td className="text-right py-3">${comp.price_per_sf.toFixed(2)}</td>
                          <td className="text-right py-3">
                            <Badge variant={comp.occupancy === "98%" ? "default" : "secondary"}>{comp.occupancy}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Comparables Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>Market Analysis Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(comparables.reduce((sum, comp) => sum + comp.price, 0) / comparables.length)}
                    </div>
                    <p className="text-sm text-muted-foreground">Average Sale Price</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        comparables.reduce((sum, comp) => sum + comp.price_per_unit, 0) / comparables.length,
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Average Price/Unit</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      ${(comparables.reduce((sum, comp) => sum + comp.price_per_sf, 0) / comparables.length).toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Average Price/SF</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contact Information */}
        {propertyDetails?.offered_by && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📞</span>
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">{propertyDetails.offered_by.company}</h4>
                  <p className="text-sm text-muted-foreground">{propertyDetails.offered_by.address}</p>
                </div>
                <div>
                  <h4 className="font-semibold">{propertyDetails.offered_by.contact_person}</h4>
                  <p className="text-sm text-muted-foreground">{propertyDetails.offered_by.phone}</p>
                  <p className="text-sm text-muted-foreground">{propertyDetails.offered_by.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
