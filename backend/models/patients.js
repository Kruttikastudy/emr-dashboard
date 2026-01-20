import mongoose from "mongoose";
const { Schema } = mongoose;

const patientSchema = new Schema({
  name: {
    type: {
      first: { type: String, required: true },
      middle: { type: String },
      last: { type: String, required: true }
    },
    required: true
  },

  date_of_birth: {
    type: String,
    required: true,
    match: /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/
  },

  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  
  blood_group: {
    type: String,
    required: true,
    enum: [
      'A Positive (A⁺)', 'A Negative (A⁻)',
      'B Positive (B⁺)', 'B Negative (B⁻)',
      'AB Positive (AB⁺)', 'AB Negative (AB⁻)',
      'O Positive (O⁺)', 'O Negative (O⁻)',
      'None'
    ]
  },

  address: {
    type: {
      street: { type: String },
      street2: { type: String },
      city: { type: String, required: true },
      postal_code: { type: String, required: true },
      district: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true }
    },
    required: true
  },

  occupation: {
    type: String,
    enum: [
      'Unemployed', 'Employed', 'Student', 'Business',
      'Services', 'Retired', 'Government /civil service', 'Other'
    ]
  },

  aadhaar: {
    type: String,
    required: [true, 'Aadhaar number is required'],
    match: [/^[0-9]{12}$/, 'Aadhaar number must be exactly 12 digits']
  },

  pan: {
    type: String,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN card format']
  },

  img: {
    file_id: { type: Schema.Types.ObjectId }
  },

  contact_info: {
    type: {
      mobile: {
        type: {
          code: {
            type: String,
            required: true,
            match: /^\+\d{1,3}$/
          },
          number: {
            type: String,
            required: true,
            match: /^\d{7,10}$/
          }
        },
        required: true
      },
      home_phone: {
        code: {
          type: String,
          match: /^\+\d{1,3}$/
        },
        number: {
          type: String,
          match: /^\d{7,10}$/
        }
      },
      work_phone: {
        code: {
          type: String,
          match: /^\+\d{1,3}$/
        },
        number: {
          type: String,
          match: /^\d{7,10}$/
        }
      },
      email: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      },
      preferred_contact_methods: {
        type: [{
          type: String,
          enum: ['Phone Call', 'Messages', 'Email']
        }],
        required: true
      },
      emergency_contact: {
        type: [{
          name: {
            type: {
              first: { type: String, required: true },
              middle: { type: String },
              last: { type: String, required: true }
            },
            required: true
          },
          relationship: { type: String, required: true },
          phone: {
            type: {
              code: {
                type: String,
                required: true,
                match: /^\+\d{1,3}$/
              },
              number: {
                type: String,
                required: true,
                match: /^\d{7,10}$/
              }
            },
            required: true
          },
          email: {
            type: String,
            required: true,
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          }
        }],
        required: true
      }
    },
    required: true
  },
  
  insurance: {
    type: {
      primary: {
        type: {
          company_name: { type: String, required: true },
          policy_number: { type: String, required: true },
          group_number: { type: String },
          plan_type: {
            type: String,
            required: true,
            enum: [
              'Health Maintenance Organization (HMO)',
              'Preferred Provider Organization (PPO)',
              'Point of Service (POS)',
              'Exclusive Provider Organization (EPO)',
              'Medicare', 'Medicaid', 'Private Insurance', 'Other'
            ]
          },
          effective_start: {
            type: String,
            match: /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/
          },
          effective_end: {
            type: String,
            match: /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/
          }
        },
        required: true
      },
      secondary: {
        company_name: { type: String },
        policy_number: { type: String },
        group_number: { type: String },
        plan_type: {
          type: String,
          enum: [
            'Health Maintenance Organization (HMO)',
            'Preferred Provider Organization (PPO)',
            'Point of Service (POS)',
            'Exclusive Provider Organization (EPO)',
            'Medicare', 'Medicaid', 'Private Insurance', 'Other'
          ]
        },
        effective_start: {
          type: String,
          match: /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/
        },
        effective_end: {
          type: String,
          match: /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/
        }
      },
      insurance_contact_number: {
        type: String,
        required: true,
        match: /^\d{7,10}$/
      },
      insurance_card_img: {
        file_id: { type: Schema.Types.ObjectId }
      }
    },
    required: true
  },
  allergies: [{
    allergen: {
      type: String,
      enum: [
        'Penicillin', 'Sulfa Drugs', 'Aspirin', 'Shellfish',
        'Nuts (e.g., peanuts, almonds, cashews)', 'Eggs', 'Milk', 'Wheat', 'Soy',
        'Pollen (specific types, e.g., ragweed, grass)', 'Dust Mites', 'Latex', 'Nickel',
        'Pet Dander', 'Bee Venom', 'Mould', 'Certain Medications', 'Other'
      ]
    },
    reaction: {
      type: String,
      enum: [
        'Rash', 'Itching', 'Hives', 'Swelling', 'Difficulty Breathing',
        'Anaphylaxis', 'Nausea', 'Vomiting', 'Diarrhoea', 'Dizziness',
        'Fainting', 'Sneezing', 'Other'
      ]
    },
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe', 'Critical', 'Unknown', 'None']
    },
    category: {
      type: String,
      enum: ['Medications', 'Foods', 'Environmental', 'Insects', 'Latex', 'Other']
    },
    code: {
      type: String,
      enum: ['A100', 'A200', 'A300', 'A400', 'A500', 'A600']
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Resolved', 'Chronic', 'Acute', 'Recurrent', 'Unknown', 'None']
    }
  }],
  
  family_history: {
    family_members: [{
      name: {
        first: { type: String, required: true },
        middle: { type: String },
        last: { type: String, required: true }
      },
      date_of_birth: {
        type: String,
        required: true,
        match: /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/
      },
      gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
      },
      relationship: {
        type: String,
        required: true,
        enum: [
          'Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter',
          'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Cousin',
          'Nephew', 'Niece', 'Spouse', 'Other'
        ]
      },
      deceased: { type: Boolean, required: true },
      medical_conditions: [{ type: String }],
      genetic_conditions: [{
        condition_name: { type: String, required: true },
        affected_family_member: {
          type: String,
          enum: [
            'Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter',
            'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Cousin',
            'Nephew', 'Niece', 'Spouse', 'Other'
          ],
          required: true
        },
        genetic_testing_results: {
          type: String,
          required: true,
          enum: ['Positive', 'Negative', 'Pending', 'Unknown', 'Not Tested']
        }
      }]
    }]
  },

  social_history: {
    tobacco_smoking: {
      current_status: {
        type: String,
        enum: ['Current Smoker', 'Former Smoker', 'Never Smoked']
      },
      average_daily_consumption: { type: Number },
      duration_of_use: { type: String },
      duration_unit: {
        type: String,
        enum: ['days', 'weeks', 'months', 'years']
      },
      quit_date: {
        type: String,
        match: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
      },
      notes: { type: String }
    },

    tobacco_consumption: {
      current_status: {
        type: String,
        enum: ['Never used', 'Current user', 'Former user', 'Social user']
      },
      average_daily_consumption: { type: Number },
      duration_of_use: { type: String },
      duration_unit: {
        type: String,
        enum: ['days', 'weeks', 'months', 'years']
      },
      quit_date: {
        type: String,
        match: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
      },
      notes: { type: String }
    },

    alcohol_use: {
      current_status: {
        type: String,
        enum: ['Non-Drinker', 'Moderate Drinker', 'Heavy Drinker']
      },
      average_weekly_consumption: { type: String },
      type_of_alcohol: {
        type: String,
        enum: [
          'Beer', 'Wine', 'Red wine', 'Wiskey', 'Vodka', 'Rum',
          'Gin', 'Tequila', 'Brandy', 'Mixed Drinks', 'Other'
        ]
      },
      period_of_use: { type: String },
      notes: { type: String }
    },

    social_history_free_text: {
      notes: { type: String }
    },

    financial_resources: {
      income_level: {
        type: String,
        enum: ['High', 'Moderate', 'Low']
      },
      employment_status: {
        type: String,
        enum: [
          'Employed Full-time', 'Employed Part-time', 'Employed',
          'Unemployed', 'Self-employed', 'Student', 'Retired',
          'Homemaker', 'Disabled', 'Other'
        ]
      },
      financial_support: {
        type: String,
        enum: [
          'None', 'Family', 'Government', 'Disability Benefits',
          'Retirement Benefits', 'Child Support', 'Alimony', 'Other'
        ]
      },
      notes: { type: String }
    },

    education: {
      highest_level_of_education: {
        type: String,
        enum: [
          'Uneducated', 'Below 10th', '10th Passed', '12th Passed',
          'BMS', 'High School', 'Diploma', "Bachelor's", "Master's",
          'PhD', 'Other'
        ]
      },
      notes: { type: String }
    },

    physical_activity: {
      frequency: { type: String },
      type_of_exercise: { type: String },
      duration: { type: Number },
      duration_unit: {
        type: String,
        enum: ['min', 'seconds', 'hr']
      },
      consistency: {
        type: String,
        enum: ['Regular', 'Occasional', 'Irregular', 'Never']
      },
      notes: { type: String }
    },

    stress: {
      perceived_stress_level: {
        type: String,
        enum: ['None', 'Low', 'Moderate', 'High', 'Very High']
      },
      major_stressors: { type: String },
      coping_mechanisms: { type: String },
      notes: { type: String }
    },

    social_isolation_connection: {
      isolation_status: {
        type: String,
        enum: [
          'Not Isolated', 'Self-Isolating', 'Quarantined',
          'Socially Isolated', 'Other', 'Low', 'Moderate', 'High'
        ]
      },
      social_support: {
        type: String,
        enum: [
          'Strong', 'Moderate', 'Limited', 'None', 'Unknown',
          'Supportive family', 'Friends', 'Community groups',
          'Minimal Support', 'Other'
        ]
      },
      frequency_of_social_interactions: { type: String },
      notes: { type: String }
    },

    exposure_to_violence: {
      type_of_violence: {
        type: String,
        enum: [
          '', 'Physical', 'Sexual violence', 'Emotional abuse',
          'Financial', 'Domestic violence', 'Child Abuse', 'Elder Abuse',
          'Bullying', 'Workplace violence', 'Community violence', 'Other'
        ]
      },
      date_of_last_exposure: {
        type: String,
        match: /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/
      },
      support_or_intervention_received: { type: String },
      notes: { type: String }
    },

    gender_identity: {
      gender_identity: {
        type: String,
        enum: [
          'Male', 'Female', 'Non-binary', 'Transgender',
          'Other', 'Prefer not to say'
        ]
      },
      notes: { type: String }
    },

    sexual_orientation: {
      sexual_orientation: {
        type: String,
        enum: [
          'Straight', 'Heterosexual', 'Homosexual', 'Bisexual',
          'Pansexual', 'Asexual', 'Queer', 'Questioning',
          'Other', 'Prefer not to say'
        ]
      },
      notes: { type: String }
    },

    nutrients_history: {
      dietary_preferences: { type: String },
      supplement_usage: {
        type: String,
        enum: ['Yes', 'Occasionally', 'No']
      },
      notes: { type: String }
    }
  }
}, {
  timestamps: true
});

export default mongoose.models.Patient || mongoose.model('Patient', patientSchema);