export const schema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      additionalProperties: false,
      properties: {
        name: {
          type: 'string',
          minLength: 1,
          maxLength: 36
        }
      },
      required: [
        'name'
      ]
    }
  }
};
