import React, { useState } from "react";
import ServiceProviderSignupStep1 from "../ServiceProviderSignupStep1/ServiceProviderSignupStep1";
import ServiceProviderSignupStep2 from "../ServiceProviderSignupStep2/ServiceProviderSignupStep2";

const ServiceProviderSignupForm = () => {
  const [step, setStep] = useState(1);

  return (
    <>
      {step === 1 && <ServiceProviderSignupStep1 setStep={setStep} />}
      {step === 2 && <ServiceProviderSignupStep2 setStep={setStep} />}
    </>
  );
};

export default ServiceProviderSignupForm;


