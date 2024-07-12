import React, { useState, useRef } from "react";

const UserAddressLookup = ({ onSelect }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef(null);

  const apiKey = "AAPTxy8BH1VEsoebNVZXo8HurMVXuDltoL2-__zX9oWapvGjvIXtrq4B66lCzHQP-PfN0MVMOyNVwaFw7rTv79veBf6m5nbtxSt0aWZogDuh3mLQJLFrNM75upQENrNcdadrbslo2MTbtx6cZAMk8ZwBt9IOFqxtOW5BcB5U_yf3_pWVFvKoDKp-Ppi1btYtwIGGIfvEQcf1n7nfAIzFzGmyK3gTeL1-FBey8tl5lPPzqXc.AT1_ZskDEujR"
  const locatorServiceUrl = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest";

  const fetchSuggestions = async (address) => {
    try {
      const response = await fetch(`${locatorServiceUrl}?f=json&text=${address}&maxSuggestions=5&token=${apiKey}`);
      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to fetch address suggestions.");
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 2) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.text);
    setSuggestions([]);
    onSelect(suggestion);
  };

  return (
    <div className="autocomplete-container">
      <input
        type="text"
        value={query}
        ref={inputRef}
        placeholder="Enter Address"
        className="autocomplete-input"
        onChange={handleChange}
      />
      {suggestions.length > 0 && (
        <ul className="autocomplete-suggestions">
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSelect(suggestion)}>
              {suggestion.text}
            </li>
          ))}
        </ul>
      )}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default UserAddressLookup;
