import { Button, Step, StepLabel, Stepper } from "@mui/material";

type Props = {
  step: "missing_procore" | "missing_acc";
  selectedCompanyId: string;
};

export default function Onboarding({ step, selectedCompanyId }: Props) {
  return (
    <div className="rounded-xl w-96 h-96">
      <Stepper activeStep={step == "missing_procore" ? 0 : 1} alternativeLabel>
        {/* <Step key="Configure Procore">
          <StepLabel>Configure Procore</StepLabel>
        </Step> */}
        <Step key="Configure ACC">
          <StepLabel>Configure ACC</StepLabel>
        </Step>
        <Step key="Setup Connections">
          <StepLabel>Setup Connections</StepLabel>
        </Step>
      </Stepper>
      {/* @ts-ignore */}
      <h3 className="text-2xl font-bold text-center">
        {step == "missing_procore"
          ? "Missing procore, link it using the button below."
          : selectedCompanyId
          ? "Missing ACC, link it using the button below."
          : "Please link your ACC to this project."}
      </h3>

      <Button
        color="success"
        variant="contained"
        // disabled={step == "missing_acc" && !selectedCompanyId}
        href={
          step == "missing_procore"
            ? "/api/oauth/procore/login"
            : "/api/oauth/acc/login?company_id=" + selectedCompanyId
        }
      >
        Link Project
      </Button>
    </div>
  );
}
