"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import jsPDF from "jspdf"

// ============= INTERFACES MATCHING SCHEMA =============

export interface PropertyDetails {
  property_name: string
  address: string
  unit_count: number
  rsf: number
  lot_size?: number | null
  year_built?: number | null
  unit_types: Array<{
    bedrooms: number
    number_of_units: number
    unit_sf: number
    monthly_rent: number
    rent_psf: number
  }>
  offered_by: {
    company: string
    address?: string
    contact_person: string
    phone?: string
    email?: string
  }
}

export interface BrokerInfo {
  broker_contact_info: {
    name: string
    phone?: string
    email?: string
  }
  brokerage: string
  investment_strategy: string
}

export interface FinancialSummary {
  property_name: string
  address: string
  units: number
  total_square_feet?: number
  financials_actual?: {
    gross_rental_income?: number
    vacancy_allowance?: {
      amount?: number
      percentage?: string
    }
    effective_gross_income?: number
    operating_expenses?: {
      total_calculated_opex?: number
      individual_expenses?: {
        property_taxes?: number
        insurance?: number
        maintenance?: number
      }
      notes_on_other_expenses_in_context?: string[]
    }
    net_operating_income?: number
  }
  asking_price?: number | null
  cap_rate?: number | null
  irr?: number | null
  rents?: Array<{
    unit_type: string
    number_of_units: number
    square_feet: number
    monthly_rent: number
    rent_per_sf: number
  }>
  property_taxes?: number
  assessed_value?: number | null
}

export interface ReportSummaries {
  property_summary?: {
    name?: string
    address?: string
    units?: number
    total_square_feet?: number
    property_type?: string
  }
  financial_summary?: {
    year?: number
    gross_rental_income?: number
    expenses?: {
      total_operating_expenses?: number
      property_taxes?: number
      insurance?: number
      maintenance?: number
      water_and_sewer?: number
      management_fee_percentage?: string
      management_fee_amount?: number
    }
    vacancy_allowance_percentage?: string
    vacancy_allowance_amount?: number
    net_operating_income?: number
    notes?: string[]
  }
  rent_roll_overview?: {
    total_units?: number
    total_square_feet?: number
    unit_types?: Array<{
      bedrooms?: number
      number_of_units?: number
      percentage_of_building?: string
      unit_sf?: number
      monthly_rent?: number
      rent_per_sf?: number
    }>
    notes?: string
  }
  tenant_information?: object | null
  market_overview?: {
    radius?: string
    population?: {
      projection?: number
      estimate?: number
      census?: number
      growth_recent?: string
      growth_past?: string
    }
    households?: {
      projection?: number
      estimate?: number
      census?: number
      owner_occupied?: string
      renter_occupied?: string
      growth_recent?: string
      growth_past?: string
    }
    average_household_income?: number
    median_household_income?: number
  }
  comparables_summary?: object | null
  investment_highlights?: string[]
  value_add_opportunities?: object | null
  debt_financing_summary?: any | null
}

export interface ModelingData {
  gross_potential_rent?: { actual?: number }
  NOI?: { actual?: number }
  cap_rate?: string
  opex_breakdown?: {
    actual?: {
      total_expenses?: number
      items?: Array<{
        name: string
        amount: number
        note?: string
      }>
    }
  }
  price_per_unit?: string
  price_per_sf?: string
}

export interface ProsCons {
  pros: string[]
  cons: string[]
}

export interface RealEstateReportData {
  property_details?: PropertyDetails
  broker_info?: BrokerInfo
  financial_summary?: FinancialSummary
  report_summaries?: ReportSummaries
  modeling_data?: ModelingData
  proscons?: {
    [section: string]: ProsCons
  }
}

interface LegacyReportData {
  id: string
  title: string
  content: string
  createdAt: string
}

type ReportData = RealEstateReportData | LegacyReportData

interface ReportViewerProps {
  report: ReportData
  reportId?: string  // REQUIRED for PDF export
}

// ============= UTILITY FUNCTIONS =============

function isLegacyReport(report: ReportData): report is LegacyReportData {
  return "id" in report && "title" in report && "content" in report
}

function formatCurrency(amount?: number): string {
  if (typeof amount !== "number") return "-"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatNumber(num?: number): string {
  if (typeof num !== "number") return "-"
  return new Intl.NumberFormat("en-US").format(num)
}

// ============= MAIN COMPONENT =============

export function ReportViewer({ report, reportId }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "financials" | "market" | "modeling" | "comparables" | "proscons"
  >("overview")

  // PDF download handler using jsPDF
  const handleDownloadPDF = () => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20; // Initial vertical position

    const title =
      propertyDetails?.property_name ||
      reportSummaries?.property_summary?.name ||
      "Property Analysis Report";

    // -------------------- HEADER --------------------
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, y, { align: "center" });
    y += 10;
    doc.setLineWidth(0.5);
    doc.line(10, y, pageWidth - 10, y);
    y += 10;

    const addSection = (sectionTitle, lines = []) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(sectionTitle, 10, y);
      y += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      lines.forEach((line) => {
        doc.text(line, 12, y);
        y += 8;
      });
      y += 5;
    };

    // -------------------- OVERVIEW --------------------
    const overviewLines = [
      `Address: ${propertyDetails?.address || reportSummaries?.property_summary?.address || ""}`,
      `Units: ${propertyDetails?.unit_count || reportSummaries?.property_summary?.units || ""}`,
      `Total SF: ${propertyDetails?.rsf || reportSummaries?.property_summary?.total_square_feet || ""}`,
      `Type: ${reportSummaries?.property_summary?.property_type || "Multifamily"}`
    ];
    addSection("Overview", overviewLines);

    // -------------------- FINANCIALS --------------------
    const financialLines = [
      `Gross Rental Income: ${formatCurrency(financialSummary?.financials_actual?.gross_rental_income || reportSummaries?.financial_summary?.gross_rental_income || 0)}`,
      `Net Operating Income: ${formatCurrency(financialSummary?.financials_actual?.net_operating_income || reportSummaries?.financial_summary?.net_operating_income || 0)}`,
      `Cap Rate: ${modelingData?.cap_rate || "TBD"}`
    ];
    addSection("Financials", financialLines);

    // -------------------- MARKET --------------------
    if (reportSummaries?.market_summary) {
      const marketLines = Object.entries(reportSummaries.market_summary).map(([k, v]) => `${k}: ${v}`);
      addSection("Market", marketLines);
    }

    // -------------------- MODELING --------------------
    if (modelingData) {
      const modelingLines = Object.entries(modelingData).map(([k, v]) => `${k}: ${v}`);
      addSection("Modeling", modelingLines);
    }

    // -------------------- COMPARABLES --------------------
    if (reportSummaries?.comparables?.length) {
      const comparablesLines = reportSummaries.comparables.map(
        (comp, idx) => `${idx + 1}. ${comp.name} - ${comp.address} - ${comp.units} Units`
      );
      addSection("Comparables", comparablesLines);
    }

    // -------------------- PROS & CONS --------------------
    const prosConsLines = [];
    if (reportSummaries?.pros?.length) {
      prosConsLines.push("Pros:");
      reportSummaries.pros.forEach((p) => prosConsLines.push(`- ${p}`));
    }
    if (reportSummaries?.cons?.length) {
      prosConsLines.push("Cons:");
      reportSummaries.cons.forEach((c) => prosConsLines.push(`- ${c}`));
    }
    if (prosConsLines.length) addSection("Pros & Cons", prosConsLines);

    // -------------------- SAVE PDF --------------------
    doc.save(`${title}.pdf`);
  } catch (err) {
    console.error("PDF generation failed:", err);
  }
};

  // Legacy Report View
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

  // Extract data sections
  const propertyDetails = report.property_details
  const financialSummary = report.financial_summary
  const reportSummaries = report.report_summaries
  const modelingData = report.modeling_data
  const debtFinancing = reportSummaries?.debt_financing_summary
  const comparables = reportSummaries?.comparables_summary
  const proscons = report.proscons

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="container mx-auto px-6 py-8" id="report-content">
        {/* ========== HEADER ========== */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">
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
                  {formatNumber(propertyDetails?.rsf || reportSummaries?.property_summary?.total_square_feet)} SF
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              📤 Export
            </Button>
          </div>

          {/* ========== KEY METRICS ========== */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(
                    financialSummary?.financials_actual?.gross_rental_income ||
                    reportSummaries?.financial_summary?.gross_rental_income
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Gross Rental Income</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(
                    financialSummary?.financials_actual?.net_operating_income ||
                    reportSummaries?.financial_summary?.net_operating_income
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Net Operating Income</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600">
                  {financialSummary?.financials_actual?.vacancy_allowance?.percentage ||
                    reportSummaries?.financial_summary?.vacancy_allowance_percentage ||
                    "-"}
                </div>
                <p className="text-sm text-muted-foreground">Vacancy Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">
                  {modelingData?.cap_rate || financialSummary?.cap_rate || "TBD"}
                </div>
                <p className="text-sm text-muted-foreground">Cap Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* ========== NAVIGATION TABS ========== */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg overflow-x-auto">
            {[
              { id: "overview", label: "Overview" },
              { id: "financials", label: "Financials" },
              { id: "market", label: "Market" },
              { id: "modeling", label: "Modeling" },
              { id: "comparables", label: "Comparables" },
              { id: "proscons", label: "Pros & Cons" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
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

        {/* ========== TAB CONTENT ========== */}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Property Details */}
            {propertyDetails && (
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Property Name:</span>
                          <span>{propertyDetails.property_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Address:</span>
                          <span className="text-right">{propertyDetails.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Units:</span>
                          <span>{propertyDetails.unit_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total SF:</span>
                          <span>{formatNumber(propertyDetails.rsf)}</span>
                        </div>
                        {propertyDetails.year_built && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Year Built:</span>
                            <span>{propertyDetails.year_built}</span>
                          </div>
                        )}
                        {propertyDetails.lot_size && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Lot Size:</span>
                            <span>{propertyDetails.lot_size}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Unit Mix</h4>
                      <div className="space-y-2">
                        {propertyDetails.unit_types?.map((unitType, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <div>
                              <span className="font-medium">{unitType.bedrooms} BR</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                ({unitType.unit_sf} SF)
                              </span>
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
            )}

            {/* Investment Highlights */}
            {reportSummaries?.investment_highlights && reportSummaries.investment_highlights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Investment Highlights</CardTitle>
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
                  <CardTitle>Debt Financing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {Object.entries(debtFinancing).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-2 bg-muted rounded">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            {propertyDetails?.offered_by && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold">{propertyDetails.offered_by.company}</h4>
                      {propertyDetails.offered_by.address && (
                        <p className="text-sm text-muted-foreground">{propertyDetails.offered_by.address}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{propertyDetails.offered_by.contact_person}</h4>
                      {propertyDetails.offered_by.phone && (
                        <p className="text-sm text-muted-foreground">{propertyDetails.offered_by.phone}</p>
                      )}
                      {propertyDetails.offered_by.email && (
                        <p className="text-sm text-muted-foreground">{propertyDetails.offered_by.email}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* FINANCIALS TAB */}
        {activeTab === "financials" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Gross Rental Income</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(financialSummary?.financials_actual?.gross_rental_income)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground ml-4">
                      Less: Vacancy Allowance (
                      {financialSummary?.financials_actual?.vacancy_allowance?.percentage || "-"}
                      )
                    </span>
                    <span className="text-red-600">
                      ({formatCurrency(financialSummary?.financials_actual?.vacancy_allowance?.amount)})
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Effective Gross Income</span>
                    <span className="font-bold">
                      {formatCurrency(financialSummary?.financials_actual?.effective_gross_income)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground ml-4">Less: Operating Expenses</span>
                    <span className="text-red-600">
                      ({formatCurrency(
                        financialSummary?.financials_actual?.operating_expenses?.total_calculated_opex
                      )})
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t-2 border-primary">
                    <span className="font-bold text-lg">Net Operating Income</span>
                    <span className="font-bold text-lg text-blue-600">
                      {formatCurrency(financialSummary?.financials_actual?.net_operating_income)}
                    </span>
                  </div>
                </div>

                {/* Operating Expenses Details */}
                {financialSummary?.financials_actual?.operating_expenses?.individual_expenses && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Operating Expenses Breakdown</h4>
                    <div className="space-y-2">
                      {Object.entries(financialSummary.financials_actual.operating_expenses.individual_expenses).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between p-2 bg-muted rounded text-sm">
                            <span className="capitalize">{key.replace(/_/g, " ")}</span>
                            <span className="font-medium">{formatCurrency(value as number)}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rent Roll */}
            {financialSummary?.rents && financialSummary.rents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Rent Roll</CardTitle>
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
                        {financialSummary.rents.map((rent, index) => (
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
            )}
          </div>
        )}

        {/* MARKET TAB */}
        {activeTab === "market" && reportSummaries?.market_overview && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Market Overview {reportSummaries.market_overview.radius && `(${reportSummaries.market_overview.radius})`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Population */}
                  {reportSummaries.market_overview.population && (
                    <div>
                      <h4 className="font-semibold mb-3">Population Trends</h4>
                      <div className="space-y-2 text-sm">
                        {reportSummaries.market_overview.population.projection && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Projection:</span>
                            <span>{formatNumber(reportSummaries.market_overview.population.projection)}</span>
                          </div>
                        )}
                        {reportSummaries.market_overview.population.estimate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Estimate:</span>
                            <span>{formatNumber(reportSummaries.market_overview.population.estimate)}</span>
                          </div>
                        )}
                        {reportSummaries.market_overview.population.census && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Census:</span>
                            <span>{formatNumber(reportSummaries.market_overview.population.census)}</span>
                          </div>
                        )}
                        {reportSummaries.market_overview.population.growth_recent && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Recent Growth:</span>
                            <span className="text-green-600">
                              {reportSummaries.market_overview.population.growth_recent}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Households */}
                  {reportSummaries.market_overview.households && (
                    <div>
                      <h4 className="font-semibold mb-3">Household Data</h4>
                      <div className="space-y-2 text-sm">
                        {reportSummaries.market_overview.households.owner_occupied && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Owner Occupied:</span>
                            <span>{reportSummaries.market_overview.households.owner_occupied}</span>
                          </div>
                        )}
                        {reportSummaries.market_overview.households.renter_occupied && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Renter Occupied:</span>
                            <span>{reportSummaries.market_overview.households.renter_occupied}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Income Data */}
                {(reportSummaries.market_overview.average_household_income || 
                  reportSummaries.market_overview.median_household_income) && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Household Income</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reportSummaries.market_overview.average_household_income && (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">
                            {formatCurrency(reportSummaries.market_overview.average_household_income)}
                          </div>
                          <p className="text-sm text-muted-foreground">Average Income</p>
                        </div>
                      )}
                      {reportSummaries.market_overview.median_household_income && (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">
                            {formatCurrency(reportSummaries.market_overview.median_household_income)}
                          </div>
                          <p className="text-sm text-muted-foreground">Median Income</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* MODELING TAB */}
        {activeTab === "modeling" && modelingData && (
          <div className="space-y-6">
            {/* Operating Expenses */}
            {modelingData.opex_breakdown?.actual && (
              <Card>
                <CardHeader>
                  <CardTitle>Operating Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {modelingData.opex_breakdown.actual.items?.map((item, index) => (
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
                        {formatCurrency(modelingData.opex_breakdown.actual.total_expenses)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {modelingData.price_per_unit && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-xl font-bold">{modelingData.price_per_unit}</div>
                      <p className="text-sm text-muted-foreground">Price Per Unit</p>
                    </div>
                  )}
                  {modelingData.price_per_sf && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-xl font-bold">{modelingData.price_per_sf}</div>
                      <p className="text-sm text-muted-foreground">Price Per SF</p>
                    </div>
                  )}
                  {modelingData.cap_rate && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-xl font-bold">{modelingData.cap_rate}</div>
                      <p className="text-sm text-muted-foreground">Cap Rate</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* COMPARABLES TAB */}
        {activeTab === "comparables" && comparables && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comparable Properties</CardTitle>
              </CardHeader>
              <CardContent>
                {typeof comparables === 'object' && !Array.isArray(comparables) ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">Comparables data available in report.</p>
                    <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(comparables, null, 2)}
                    </pre>
                  </div>
                ) : Array.isArray(comparables) && comparables.length > 0 ? (
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
                        {comparables.map((comp: any, index: number) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="py-3">
                              <div>
                                <div className="font-medium">{comp.address || "-"}</div>
                                {comp.rsf && (
                                  <div className="text-sm text-muted-foreground">
                                    {formatNumber(comp.rsf)} SF
                                    {comp.lot_size && ` • ${comp.lot_size}`}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="text-right py-3 font-medium">
                              {formatCurrency(comp.price)}
                            </td>
                            <td className="text-right py-3">
                              {comp.date_sold ? new Date(comp.date_sold).toLocaleDateString() : "-"}
                            </td>
                            <td className="text-right py-3">
                              <Badge variant="secondary">{comp.cap_rate || "-"}</Badge>
                            </td>
                            <td className="text-right py-3">{comp.units || "-"}</td>
                            <td className="text-right py-3">
                              {formatCurrency(comp.price_per_unit)}
                            </td>
                            <td className="text-right py-3">
                              ${typeof comp.price_per_sf === 'number' ? comp.price_per_sf.toFixed(2) : comp.price_per_sf}
                            </td>
                            <td className="text-right py-3">
                              <Badge variant={comp.occupancy === "98%" ? "default" : "secondary"}>
                                {comp.occupancy || "-"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Comparables Summary */}
                    <div className="mt-6">
                      <h4 className="font-semibold mb-4">Market Analysis Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(
                              comparables.reduce((sum: number, comp: any) => sum + (comp.price || 0), 0) / comparables.length
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">Average Sale Price</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(
                              comparables.reduce((sum: number, comp: any) => sum + (comp.price_per_unit || 0), 0) / comparables.length
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">Average Price/Unit</p>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            ${(
                              comparables.reduce((sum: number, comp: any) => {
                                const psf = typeof comp.price_per_sf === 'number' 
                                  ? comp.price_per_sf 
                                  : parseFloat(comp.price_per_sf) || 0
                                return sum + psf
                              }, 0) / comparables.length
                            ).toFixed(2)}
                          </div>
                          <p className="text-sm text-muted-foreground">Average Price/SF</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No comparables data available.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* PROS & CONS TAB */}
        {activeTab === "proscons" && (
          <div className="space-y-6">
            {proscons && Object.keys(proscons).length > 0 ? (
              Object.entries(proscons).map(([section, data]) => (
                <Card key={section}>
                  <CardHeader>
                    <CardTitle>
                      {section.charAt(0).toUpperCase() + section.slice(1)} - Pros & Cons
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-green-700">Pros</h4>
                        {data.pros && data.pros.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-2">
                            {data.pros.map((pro: string, idx: number) => (
                              <li key={idx}>{pro}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">No pros listed.</p>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-red-700">Cons</h4>
                        {data.cons && data.cons.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-2">
                            {data.cons.map((con: string, idx: number) => (
                              <li key={idx}>{con}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">No cons listed.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">No pros and cons analysis available.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Broker Info (if available) */}
        {report.broker_info && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Broker Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">{report.broker_info.brokerage}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Contact: {report.broker_info.broker_contact_info.name}
                  </p>
                  {report.broker_info.broker_contact_info.phone && (
                    <p className="text-sm text-muted-foreground">
                      Phone: {report.broker_info.broker_contact_info.phone}
                    </p>
                  )}
                  {report.broker_info.broker_contact_info.email && (
                    <p className="text-sm text-muted-foreground">
                      Email: {report.broker_info.broker_contact_info.email}
                    </p>
                  )}
                </div>
                {report.broker_info.investment_strategy && (
                  <div>
                    <h4 className="font-semibold mb-2">Investment Strategy</h4>
                    <p className="text-sm">{report.broker_info.investment_strategy}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}