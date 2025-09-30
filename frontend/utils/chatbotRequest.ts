"use server"
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Load schema.json dynamically
// const schemaJson = JSON.parse(fs.readFileSync("utils/schema.json", "utf-8"));
const schemaJson= {
"type": "object",
"properties":{
  "property_details": {
    "title": "PropertyDetails",
    "description": "Schema for real estate property details",
    "type": "object",
    "properties": {
      "property_name": {
        "type": "string",
        "description": "Name of the property"
      },
      "address": {
        "type": "string",
        "description": "Property address"
      },
      "unit_count": {
        "type": "integer",
        "description": "Number of units"
      },
      "rsf": {
        "type": "integer",
        "description": "Rentable square feet"
      },
      "lot_size": {
        "type": ["number", "null"],
        "description": "Lot size in acres or square feet"
      },
      "year_built": {
        "type": ["integer", "null"],
        "description": "Year built"
      },
      "unit_types": {
        "type": "array",
        "description": "List of different unit types",
        "items": {
          "type": "object",
          "properties": {
            "bedrooms": { "type": "integer" },
            "number_of_units": { "type": "integer" },
            "unit_sf": { "type": "number" },
            "monthly_rent": { "type": "number" },
            "rent_psf": { "type": "number" }
          },
          "required": ["bedrooms", "number_of_units", "unit_sf", "monthly_rent", "rent_psf"]
        }
      },
      "offered_by": {
        "type": "object",
        "description": "Information about the offering company",
        "properties": {
          "company": { "type": "string" },
          "address": { "type": "string" },
          "contact_person": { "type": "string" },
          "phone": { "type": "string" },
          "email": { "type": "string" }
        },
        "required": ["company", "contact_person"]
      }
    },
    "required": ["property_name", "address", "unit_count", "rsf", "unit_types", "offered_by"]
  },
  "broker_info": {
    "title": "BrokerInfo",
    "description": "Schema for broker contact and investment strategy",
    "type": "object",
    "properties": {
      "broker_contact_info": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "phone": { "type": "string" },
          "email": { "type": "string" }
        },
        "required": ["name"]
      },
      "brokerage": { "type": "string" },
      "investment_strategy": { "type": "string" }
    },
    "required": ["broker_contact_info", "brokerage", "investment_strategy"]
  },
  "financial_summary": {
    "title": "FinancialSummary",
    "description": "Schema for financial summary details",
    "type": "object",
    "properties": {
      "property_name": { "type": "string" },
      "address": { "type": "string" },
      "units": { "type": "integer" },
      "total_square_feet": { "type": "integer" },
      "financials_actual": {
        "type": "object",
        "properties": {
          "gross_rental_income": { "type": "number" },
          "vacancy_allowance": {
            "type": "object",
            "properties": {
              "amount": { "type": "number" },
              "percentage": { "type": "string" }
            }
          },
          "effective_gross_income": { "type": "number" },
          "operating_expenses": {
            "type": "object",
            "properties": {
              "total_calculated_opex": { "type": "number" },
              "individual_expenses": {
                "type": "object",
                "properties": {
                  "property_taxes": { "type": "number" },
                  "insurance": { "type": "number" },
                  "maintenance": { "type": "number" }
                }
              },
              "notes_on_other_expenses_in_context": { "type": "array", "items": { "type": "string" } }
            }
          },
          "net_operating_income": { "type": "number" }
        }
      },
      "asking_price": { "type": ["number", "null"] },
      "cap_rate": { "type": ["number", "null"] },
      "irr": { "type": ["number", "null"] },
      "rents": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "unit_type": { "type": "string" },
            "number_of_units": { "type": "integer" },
            "square_feet": { "type": "integer" },
            "monthly_rent": { "type": "number" },
            "rent_per_sf": { "type": "number" }
          }
        }
      },
      "property_taxes": { "type": "number" },
      "assessed_value": { "type": ["number", "null"] }
    },
    "required": ["property_name", "address", "units"]
  },
  "report_summaries": {
    "title": "ReportSummaries",
    "description": "Schema for various report summaries",
    "type": "object",
    "properties": {
      "property_summary": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "address": { "type": "string" },
          "units": { "type": "integer" },
          "total_square_feet": { "type": "integer" },
          "property_type": { "type": "string" }
        }
      },
      "financial_summary": {
        "type": "object",
        "properties": {
          "year": { "type": "integer" },
          "gross_rental_income": { "type": "number" },
          "expenses": {
            "type": "object",
            "properties": {
              "total_operating_expenses": { "type": "number" },
              "property_taxes": { "type": "number" },
              "insurance": { "type": "number" },
              "maintenance": { "type": "number" },
              "water_and_sewer": { "type": "number" },
              "management_fee_percentage": { "type": "string" },
              "management_fee_amount": { "type": "number" }
            }
          },
          "vacancy_allowance_percentage": { "type": "string" },
          "vacancy_allowance_amount": { "type": "number" },
          "net_operating_income": { "type": "number" },
          "notes": { "type": "array", "items": { "type": "string" } }
        }
      },
      "rent_roll_overview": {
        "type": "object",
        "properties": {
          "total_units": { "type": "integer" },
          "total_square_feet": { "type": "integer" },
          "unit_types": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "bedrooms": { "type": "integer" },
                "number_of_units": { "type": "integer" },
                "percentage_of_building": { "type": "string" },
                "unit_sf": { "type": "integer" },
                "monthly_rent": { "type": "number" },
                "rent_per_sf": { "type": "number" }
              }
            }
          },
          "notes": { "type": "string" }
        }
      },
      "tenant_information": { "type": ["object", "null"] },
      "market_overview": {
        "type": "object",
        "properties": {
          "radius": { "type": "string" },
          "population": {
            "type": "object",
            "properties": {
              "projection": { "type": "integer" },
              "estimate": { "type": "integer" },
              "census": { "type": "integer" },
              "growth_recent": { "type": "string" },
              "growth_past": { "type": "string" }
            }
          },
          "population_by_origin": {
            "type": "object",
            "properties": {
              "hispanic_origin": { "type": "integer" },
              "white": { "type": "string" },
              "black": { "type": "string" },
              "am_indian_alaskan": { "type": "string" },
              "asian": { "type": "string" },
              "hawaiian_pacific_island": { "type": "string" },
              "other": { "type": "string" }
            }
          },
          "us_armed_forces": { "type": "integer" },
          "households": {
            "type": "object",
            "properties": {
              "projection": { "type": "integer" },
              "estimate": { "type": "integer" },
              "census": { "type": "integer" },
              "growth_recent": { "type": "string" },
              "growth_past": { "type": "string" },
              "owner_occupied": { "type": "string" },
              "renter_occupied": { "type": "string" }
            }
          },
          "households_by_income": {
            "type": "object",
            "properties": {
              "total_households": { "type": "integer" },
              "less_than_25000": { "type": "string" },
              "25000_50000": { "type": "string" },
              "50000_75000": { "type": "string" },
              "75000_100000": { "type": "string" },
              "100000_125000": { "type": "string" },
              "125000_150000": { "type": "string" },
              "150000_200000": { "type": "string" },
              "200000_plus": { "type": "string" }
            }
          },
          "average_household_income": { "type": "integer" },
          "median_household_income": { "type": "integer" }
        }
      },
      "value_add_opportunities": { "type": "object"},
        "investment_highlights": { "type": "array", "items": { "type": "string" } }
    }
  },
  "comparables": {
    "title": "ComparablesSummary",
    "description": "Summary of comparable properties for the investment",
    "type": "object",
    "properties": {
        "comparables": {
            "type": "array",
            "description": "List of comparable properties",
            "items": {
                "type": "object",
                "properties": {
                    "address": {"type": "string"},
                    "price": {"type": "number"},
                    "date_sold": {"type": "string", "format": "date"},
                    "cap_rate": {"type": "number"},
                    "occupancy": {"type": "number"},
                    "rsf": {"type": "number"},
                    "lot_size": {"type": "number"}
                },
                "required": ["address", "price"]
            }
        }
    },
    "required": ["comparables"]
},
  "debt_financing":{
    "title": "DebtFinancing",
    "description": "Details of debt financing associated with the property",
    "type": "object",
    "properties": {
        "loan_amount": {"type": "number"},
        "term": {"type": "string"},
        "loan_type": {"type": "string"},
        "WALT": {"type": "string"},
        "lease_type": {"type": "string"}
    },
    "required": ["loan_amount", "term"]
},
  "modeling_data": {
    "title": "ModelingData",
    "description": "Schema for financial modeling and underwriting data",
    "type": "object",
    "properties": {
        "gross_potential_rent": {
            "type": "object",
            "properties": {
                "actual": {"type": "number"}
            }
        },
        "NOI": {
            "type": "object",
            "properties": {
                "actual": {"type": "number"}
            }
        },
        "cap_rate": {"type": "string"},
        "opex_breakdown": {
            "type": "object",
            "properties": {
                "actual": {
                    "type": "object",
                    "properties": {
                        "total_expenses": {"type": "number"},
                        "items": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "name": {"type": "string"},
                                    "amount": {"type": "number"},
                                    "note": {"type": "string"}
                                }
                            }
                        }
                    }
                }
            }
        },
        "price_per_unit": {"type": "string"},
        "price_per_sf": {"type": "string"},
        "rent_roll_mix": {
            "type": "object",
            "properties": {
                "total_units": {"type": "integer"},
                "total_square_feet": {"type": "integer"},
                "annual_gross_potential_rent": {"type": "number"},
                "monthly_gross_potential_rent": {"type": "number"},
                "unit_types": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "bedrooms": {"type": "integer"},
                            "number_of_units": {"type": "integer"},
                            "percentage_of_units": {"type": "string"},
                            "average_unit_square_feet": {"type": "integer"},
                            "average_monthly_rent": {"type": "number"},
                            "average_rent_per_sf": {"type": "number"}
                        }
                    }
                },
                "notes": {"type": "string"}
            }
        },
        "occupancy_history": {
            "type": "object",
            "properties": {
                "vacancy_allowance_percentage": {"type": "string"},
                "vacancy_allowance_amount": {"type": "number"},
                "history": {"type": "string"}
            }
        },
        "market_rent_comps": {"type": "string"},
        "value_add_plan": {"type": "string"},
        "underwriting_model": {
            "type": "object",
            "properties": {
                "components_provided": {"type": "array", "items": {"type": "string"}},
                "full_model": {"type": "string"}
            }
        }
    },
    "required": [
        "gross_potential_rent",
        "NOI",
        "cap_rate",
        "opex_breakdown",
        "price_per_unit",
        "price_per_sf",
        "rent_roll_mix"
    ]
},
  "proscons": {
    "title": "ProsCons",
    "description": "Schema to represent pros and cons of the property investment",
    "type": "object",
    "properties": {
      "pros": {
        "type": "array",
        "items": { "type": "string" },
        "description": "List of advantages or positive factors"
      },
      "cons": {
        "type": "array",
        "items": { "type": "string" },
        "description": "List of disadvantages or negative factors"
      }
    }
  }
  }
}

function mergeJsonFirstWins(json1: any, json2: any): any {
  // Handle primitive (non-object) cases
  if (typeof json1 !== "object" || json1 === null) {
    return json1 !== undefined ? json1 : json2;
  }
  if (typeof json2 !== "object" || json2 === null) {
    return json1 !== undefined ? json1 : json2;
  }
  // Merge objects recursively
  const result: any = {};
  const allKeys = new Set([...Object.keys(json1), ...Object.keys(json2)]);
  for (let key of allKeys) {
    if (json1.hasOwnProperty(key)) {
      // json1 wins when conflict
      result[key] = mergeJsonFirstWins(json1[key], json2[key]);
    } else {
      result[key] = json2[key];
    }
  }
  return result;
}

// System prompt for hybrid JSON + reasoning
const SYSTEM_PROMPT = `
You are an assistant that answers queries based on a JSON report.
Rules:
1. You are given a report JSON as reference.
2. If the query asks to modify the report, return the updated JSON.
3. If the query asks for information:
  - If it can be fully answered from the JSON, return the answer (either as JSON or plain text).
  - If it can be reasoned from JSON, generate a natural answer referencing JSON data.
4. If the answer cannot be derived or reasoned from the JSON, return exactly: {"result": "call_rag"}
Do not include extra explanations outside JSON unless generating natural answers.
`;

// export async function handleQuery(query: string, reportJson: any): Promise<any> {
//   // Validate JSON
//   const parsedReport = reportSchema.safeParse(reportJson);
//   if (!parsedReport.success) {
//     throw new Error("Invalid report JSON according to schema.json");
//   }

//   const reportStr = JSON.stringify(reportJson);

//   const messages = [
//     new SystemMessage(SYSTEM_PROMPT),
//     new HumanMessage(`Report JSON:\n${reportStr}\n\nQuery: ${query}`)
//   ];

//   const response = await llm.invoke(messages);

//   // Try to parse JSON first
//   try {
//     const parsed = JSON.parse(response.text);
//     return parsed;
//   } catch {
//     // If not JSON, return natural answer as string
//     return response.text;
//   }
// }
export async function handleQuery(query: string, reportJson: any): Promise<any> {
  const reportStr = JSON.stringify(reportJson);
  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: `Report JSON:\n${reportStr}\n\nQuery: ${query}`,
    },
  ];

  // Use OpenAI function calling for structured output
  const functions = [
    {
      name: "update_report",
      description: "Update or answer about the report using the provided schema.",
      parameters: schemaJson,
    },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages as any,
    functions,
    function_call: "auto",
    temperature: 0,
  });
  console.log("OpenAI completion:", completion.choices[0]);

  const choice = completion.choices[0];
  if (choice.finish_reason === "function_call" && choice.message.function_call) {
    // Parse function call arguments as JSON
    try {
      const args = JSON.parse(choice.message.function_call.arguments || "{}");
      // Merge with original report (first wins)
      return mergeJsonFirstWins(args, reportJson);
    } catch (e) {
      return { error: "Failed to parse function call arguments", details: e };
    }
  }
  // If not a function call, check for RAG trigger or plain answer
  const content = choice.message.content?.trim();
  if (content === '{"result": "call_rag"}' || content === '{\"result\": \"call_rag\"}') {
    return { result: "call_rag" };
  }
  // Try to parse as JSON, else return as string
  try {
    return JSON.parse(content || "");
  } catch {
    return content;
  }
}

// // Example usage
// (async () => {
//   const report = {
//     property_details: {
//       property_name: "Lund Pointe Apartments",
//       address: "3300 Valentine Ln SE, Port Orchard, WA 98366",
//       unit_count: 25,
//       rsf: 23760,
//       average_rent: 1200
//     }
//   };

//   // Example queries
//   console.log(await handleQuery("Update the address to 123 Main St.", report)); // JSON
//   console.log(await handleQuery("What is the total unit count?", report));      // JSON or plain answer
//   console.log(await handleQuery("What is the estimated monthly income?", report)); // LLM can reason using average_rent
//   console.log(await handleQuery("Tell me about nearby schools?", report));      // {"result": "call_rag"}
// })();
