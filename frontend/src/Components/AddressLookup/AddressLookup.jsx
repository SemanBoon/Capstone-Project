import React, { useState, useEffect } from "react";
import { AddressLookup } from "@addresszen/address-lookup";

const AddressLookupComponent = ({ onSelect }) => {
  const [address, setAddress] = useState("");

  useEffect(() => {
    const controller = AddressLookup.setup({
      apiKey: "ak_lygdzn10JuzhllsSRxtNpmowIgHoq",
      outputFields: {
        full_address: "#address"
      }
    });
  }, []);

  const handleChange = (e) => {
    setAddress(e.target.value);
  };

  const handleSelect = (suggestion) => {
    setAddress(suggestion.full_address);
    onSelect(suggestion);
  };

  return (
    <div>
      <input
        type="text"
        id="address"
        value={address}
        onChange={handleChange}
        placeholder="Enter Business Address"
        autoComplete="off"
      />
      <div id="address-lookup-suggestions"></div>
    </div>
  );
};


export default AddressLookupComponent;
