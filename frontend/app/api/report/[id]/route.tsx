import { type NextRequest, NextResponse } from "next/server"
import { reportStorage } from "../../upload/route"

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000/report/"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reportId = params.id
    console.log("[v0] API: Fetching report with ID:", reportId)

    if (reportId === "0" || reportId === "1" || reportId === "demo" || reportId === "test") {
      const sampleReport = {
        property_details: {
          property_name: "Point Apartments",
          address: "3300 Valentine Ln SE, Port Orchard, WA 98366",
          unit_count: 25,
          rsf: 23760,
          lot_size: null,
          year_built: null,
          unit_types: [
            {
              bedrooms: 2,
              number_of_units: 12,
              unit_sf: 840,
              monthly_rent: 829.0,
              rent_psf: 0.99,
            },
            {
              bedrooms: 3,
              number_of_units: 13,
              unit_sf: 1050,
              monthly_rent: 949.0,
              rent_psf: 0.9,
            },
          ],
          offered_by: {
            company: "NEIL WALTER COMPANY",
            address: "1940 East D Street, Suite 100 Tacoma, Washington 98421",
            contact_person: "Trevor Kovich",
            phone: "253.779.2408",
            email: "tkovich@neilwalter.com",
          },
        },
        broker_info: {
          broker_contact_info: {
            name: "Trevor Kovich",
            phone: "253.779.2408",
            email: "tkovich@neilwalter.com",
          },
          brokerage: "NEIL WALTER COMPANY",
          investment_strategy:
            "Acquisition of a multifamily property (Pointe Apartments) for rental income, as evidenced by the provided 2016 Net Operating Income (Actual) figures, including gross rental income, various expenses, and a net operating income of $158,410.20.",
        },
        financial_summary: {
          property_name: "Pointe Apartments",
          address: "3300 Valentine Ln SE | Port Orchard, WA 98366",
          units: 25,
          total_square_feet: 23760,
          financials_2016_actual: {
            gross_rental_income: 267420.0,
            vacancy_allowance: {
              amount: 8022.6,
              percentage: "3.00%",
            },
            effective_gross_income: 259397.4,
            operating_expenses: {
              total_calculated_opex: 100987.2,
              individual_expenses: {
                property_taxes: 17450.0,
                insurance: 8554.0,
                maintenance: 21000.0,
              },
            },
            net_operating_income: 158410.2,
          },
          rents: [
            {
              unit_type: "2 BR",
              number_of_units: 12,
              square_feet: 840,
              monthly_rent: 829.0,
              rent_per_sf: 0.99,
            },
            {
              unit_type: "3 BR",
              number_of_units: 13,
              square_feet: 1050,
              monthly_rent: 949.0,
              rent_per_sf: 0.9,
            },
          ],
          property_taxes: 17450.0,
        },
        report_summaries: {
          property_summary: {
            name: "Lund Pointe Apartments",
            address: "3300 Valentine Ln SE | Port Orchard, WA 98366",
            units: 25,
            total_square_feet: 23760,
            property_type: "Multifamily",
          },
          financial_summary: {
            year: 2016,
            gross_rental_income: 267420.0,
            expenses: {
              total_operating_expenses: 92964.6,
              property_taxes: 17450.0,
              insurance: 8554.0,
              maintenance: 21000.0,
              water_and_sewer: 37938.0,
              management_fee_percentage: "3%",
              management_fee_amount: 8022.6,
            },
            vacancy_allowance_percentage: "3.00%",
            vacancy_allowance_amount: 8022.6,
            net_operating_income: 158410.2,
          },
          market_overview: {
            radius: "1 Mile",
            population: {
              "2020_projection": 9651,
              "2015_estimate": 9403,
              "2010_census": 8668,
              growth_2015_2020: "2.64%",
              growth_2010_2015: "8.48%",
            },
            households: {
              "2020_projection": 3733,
              "2015_estimate": 3631,
              "2010_census": 3329,
              owner_occupied: "1,867 (51.42%)",
              renter_occupied: "1,764 (48.58%)",
            },
            average_household_income_2015: 62510,
            median_household_income_2015: 52760,
          },
          investment_highlights: [
            "25-unit multifamily offering in Port Orchard, WA",
            "Positive Net Operating Income of $158,410.20 (2016 Actual)",
            "Strong population and household growth projections in the 1, 3, and 5-mile radii",
            "Significant renter-occupied household percentage (48.58% in 1-mile radius)",
            "Offered exclusively by Neil Walter Company",
          ],
        },
        modeling_data: {
          gross_potential_rent: {
            "2016_actual": 267420.0,
          },
          NOI: {
            "2016_actual": 158410.2,
          },
          cap_rate: "Not Provided",
          opex_breakdown: {
            "2016_actual": {
              total_expenses: 92964.6,
              items: [
                {
                  name: "Property Taxes",
                  amount: 17450.0,
                },
                {
                  name: "Insurance",
                  amount: 8554.0,
                },
                {
                  name: "Maintenance",
                  amount: 21000.0,
                  note: "estimated and includes landscaping",
                },
                {
                  name: "Reserves",
                  amount: 37938.0,
                },
                {
                  name: "Management",
                  amount: 8022.6,
                  note: "3% of Gross Rental Income, based on market rate",
                },
              ],
            },
          },
        },
        debt_financing: {
          loan_amount: 1800000,
          loan_term: 30,
          loan_type: "Fixed Rate",
          interest_rate: "4.25%",
          WALT: "25 years",
          lease_type: "Triple Net",
          lender: "Regional Bank",
          loan_to_value: "75%",
          debt_service_coverage_ratio: "1.35x",
        },
        comparables: [
          {
            address: "2500 Cherry Ave SE, Port Orchard, WA",
            price: 2100000,
            date_sold: "2023-08-15",
            cap_rate: "6.2%",
            occupancy: "95%",
            rsf: 22000,
            lot_size: "1.2 acres",
            units: 24,
            price_per_unit: 87500,
            price_per_sf: 95.45,
          },
          {
            address: "1800 Bay Street, Port Orchard, WA",
            price: 1950000,
            date_sold: "2023-06-22",
            cap_rate: "6.5%",
            occupancy: "92%",
            rsf: 20500,
            lot_size: "1.0 acres",
            units: 22,
            price_per_unit: 88636,
            price_per_sf: 95.12,
          },
          {
            address: "4200 Maple Lane, Port Orchard, WA",
            price: 2350000,
            date_sold: "2023-09-10",
            cap_rate: "5.9%",
            occupancy: "98%",
            rsf: 25200,
            lot_size: "1.5 acres",
            units: 28,
            price_per_unit: 83929,
            price_per_sf: 93.25,
          },
        ],
      }
      console.log("[v0] API: Returning realistic sample report for demo ID")
      return NextResponse.json(sampleReport)
    }

    const storedData = reportStorage.get(reportId)
    console.log("[v0] API: Stored data found:", !!storedData)

    if (storedData) {
      return NextResponse.json(storedData)
    }

    try {
      const response = await fetch(`${API_BASE_URL}${reportId}`, {
        // signal: AbortSignal.timeout(5000),
      })

      console.log("got reposne, ", response)

      if (response.ok) {
        const backendData = await response.json()
        console.log("got backend data , ", backendData)
        reportStorage.set(reportId, backendData)
        return NextResponse.json(backendData)
      }
    } catch (backendError) {
      console.log("Backend not available for report fetch:", backendError)
    }

    return NextResponse.json(
      {
        error: "Report not found",
        message: "The requested report could not be found. Please ensure the report ID is correct and try again.",
        reportId,
      },
      { status: 404 },
    )
  } catch (error) {
    console.error("Report fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 })
  }
}
