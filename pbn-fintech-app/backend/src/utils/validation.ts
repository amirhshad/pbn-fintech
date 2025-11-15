import Joi from 'joi';

// User registration validation
export const registerSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+31[0-9]{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be a valid Dutch number (+31XXXXXXXXX)',
    }),
  fullName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Full name must be at least 2 characters',
      'string.max': 'Full name must be less than 100 characters',
    }),
  dateOfBirth: Joi.date()
    .max('now')
    .required()
    .messages({
      'date.max': 'Date of birth cannot be in the future',
    }),
});

// Phone verification
export const phoneVerificationSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+31[0-9]{9}$/)
    .required(),
  code: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.length': 'Verification code must be 6 digits',
      'string.pattern.base': 'Verification code must contain only numbers',
    }),
});

// Cash request validation
export const cashRequestSchema = Joi.object({
  requestType: Joi.string()
    .valid('NEED_CASH', 'HAVE_CASH')
    .required(),
  amount: Joi.number()
    .min(50)
    .max(500)
    .precision(2)
    .required()
    .messages({
      'number.min': 'Amount must be at least €50',
      'number.max': 'Amount must not exceed €500',
    }),
  locationLat: Joi.number()
    .min(50.7)
    .max(53.6)
    .required()
    .messages({
      'number.min': 'Location must be within Netherlands',
      'number.max': 'Location must be within Netherlands',
    }),
  locationLng: Joi.number()
    .min(3.3)
    .max(7.3)
    .required()
    .messages({
      'number.min': 'Location must be within Netherlands',
      'number.max': 'Location must be within Netherlands',
    }),
  locationDescription: Joi.string()
    .max(255)
    .optional(),
  radiusKm: Joi.number()
    .min(1)
    .max(25)
    .default(5)
    .optional(),
  specialRequirements: Joi.string()
    .max(500)
    .optional(),
  minUserRating: Joi.number()
    .min(1.0)
    .max(5.0)
    .precision(1)
    .optional(),
});

// Transaction confirmation
export const transactionConfirmationSchema = Joi.object({
  transactionCode: Joi.string()
    .length(6)
    .pattern(/^[0-9A-Z]+$/)
    .required(),
  qrCodeHash: Joi.string()
    .required(),
  locationLat: Joi.number()
    .required(),
  locationLng: Joi.number()
    .required(),
  locationAccuracy: Joi.number()
    .min(0)
    .max(1000)
    .optional(),
});

// User review validation
export const reviewSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required(),
  reviewText: Joi.string()
    .max(500)
    .optional()
    .allow(''),
  communicationRating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional(),
  reliabilityRating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional(),
  safetyRating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional(),
});

// Dispute report validation
export const disputeSchema = Joi.object({
  disputeType: Joi.string()
    .valid('NO_SHOW', 'WRONG_AMOUNT', 'FAKE_MONEY', 'SAFETY_CONCERN', 'RUDE_BEHAVIOR', 'LOCATION_ISSUE', 'OTHER')
    .required(),
  title: Joi.string()
    .min(5)
    .max(100)
    .required(),
  description: Joi.string()
    .min(10)
    .max(1000)
    .required(),
  evidenceUrls: Joi.array()
    .items(Joi.string().uri())
    .max(5)
    .optional()
    .default([]),
});

// Location search validation
export const locationSearchSchema = Joi.object({
  lat: Joi.number()
    .min(50.7)
    .max(53.6)
    .required(),
  lng: Joi.number()
    .min(3.3)
    .max(7.3)
    .required(),
  radius: Joi.number()
    .min(0.5)
    .max(10)
    .default(2)
    .optional(),
  locationType: Joi.string()
    .valid('BANK', 'POLICE_STATION', 'MALL', 'CAFE', 'LIBRARY', 'TRAIN_STATION', 'OTHER')
    .optional(),
});

// Dutch ID validation helper
export const dutchIdSchema = Joi.string()
  .pattern(/^[0-9]{9}$/)
  .messages({
    'string.pattern.base': 'Dutch ID number must be 9 digits',
  });

// Pagination validation
export const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional(),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .optional(),
});

// Validation middleware helper
export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
          })),
        },
      });
    }
    
    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Query validation error',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
          })),
        },
      });
    }
    
    req.query = value;
    next();
  };
};