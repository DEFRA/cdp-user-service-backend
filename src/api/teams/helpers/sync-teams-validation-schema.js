import Joi from 'joi'

const syncTeamsValidationSchema = Joi.object({
  teams: Joi.array()
    .items(
      Joi.object({
        teamId: Joi.string()
          .max(53)
          .regex(/^[a-z0-9-]+$/),
        name: Joi.string()
          .max(53)
          .regex(/^[A-Za-z0-9-]+$/),
        description: Joi.string().allow(null),
        github: Joi.string().allow(null),
        serviceCodes: Joi.array()
          .items(
            Joi.string()
              .min(3)
              .max(3)
              .regex(/^[A-Z]+$/)
          )
          .optional()
      })
    )
    .required()
    .min(1)
})

export { syncTeamsValidationSchema }
