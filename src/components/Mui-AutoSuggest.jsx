import { Autocomplete, TextField } from "@mui/material";

const MuiAutosuggest = ({
  input,
  options,
  value,
  label,
  margin,
  required,
  returnId,
  cohortIndex,
  handler,
}) => (
  <Autocomplete
    options={options}
    getOptionLabel={(option) =>
      // (typeof option === "string" && returnId
      //   ? options.find((c) => c._id === option)
      //   : option
      // )?.name
      option
    }
    value={value}
    onChange={(event, newValue) => {
      handler(input, returnId ? newValue?._id : newValue, cohortIndex);
    }}
    sx={{ width: "400px", height: "100%" }}
    renderInput={(params) => (
      <TextField
        {...params}
        label={label}
        margin={margin}
        required={required}
        variant="outlined"
      />
    )}
  />
);

MuiAutosuggest.defaultProps = {
  margin: "normal",
  required: false,
  returnId: false,
  value: null,
};

export default MuiAutosuggest;
