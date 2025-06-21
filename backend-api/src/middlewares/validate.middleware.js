const ApiError = require("../../api-error");

function validate(schema) {
  return (req, res, next) => {
    try {
      let input = {
        ...req.params,
        ...req.query,
        ...req.body,
      };
      console.log("VALIDATE INPUT", input); // đã có

      if (req.file) input.file = req.file;
      if (req.files) input.files = req.files;

      const result = schema.safeParse({ input });
      console.log("SCHEMA RESULT", result); // thêm dòng này
      if (!result.success) {
        const errorMessages = result.error.issues.map((issue) => {
          const errorPath = issue.path.join(".");
          return `${errorPath}: ${issue.message}`;
        });

        return next(new ApiError(400, errorMessages.join("; ")));
      }

      req.validated = result.data.input;
      return next();
    } catch (err) {
      return next(new ApiError(500, `Validate Error: ${err.message}`));
    }
  };
}

module.exports = validate;
