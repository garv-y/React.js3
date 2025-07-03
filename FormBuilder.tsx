import React, { useState } from "react";
import FieldBuilder from "./FieldBuilder";
import FieldRenderer from "./FieldRenderer";
import type { FieldConfig, FieldType } from "../types/types";

interface FieldItem {
  id: number;
  config: FieldConfig;
}

const FormBuilder: React.FC = () => {
  const [formTitle, setFormTitle] = useState("My Custom Form");
  const [fields, setFields] = useState<FieldItem[]>([]);
  const [formResponses, setFormResponses] = useState<{ [key: number]: any }>(
    {}
  );
  const [submittedData, setSubmittedData] = useState<{
    [key: string]: any;
  } | null>(null);
  const [useShortForm, setUseShortForm] = useState(false);

  // Add new field from toolbox
  const addField = (type: FieldType) => {
    const id = Date.now();
    const newField: FieldItem = {
      id,
      config: {
        id: id.toString(),
        type,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
        options: ["dropdown", "tags", "checkboxes", "multipleChoice"].includes(
          type
        )
          ? [{ text: "Option 1" }, { text: "Option 2" }]
          : undefined,
      },
    };
    setFields((prev) => [...prev, newField]);
  };

  // Field updates
  const updateField = (id: number, config: FieldConfig) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, config } : f)));
  };

  const removeField = (id: number) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleResponseChange = (id: number, value: any) => {
    setFormResponses((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result: { [key: string]: any } = {};

    fields.forEach((field) => {
      if (!useShortForm || field.config.displayOnShortForm) {
        const value = formResponses[field.id];
        result[field.config.label || `Field ${field.id}`] = value;
      }
    });

    setSubmittedData(result);
    localStorage.setItem("submittedData", JSON.stringify(result));
  };

  return (
    <div className="d-flex">
      {/* Left: Form + Builder */}
      <div className="container mt-4 flex-grow-1">
        <h3 className="mb-3">Form Builder</h3>

        <div className="mb-4">
          <label className="form-label">Form Title</label>
          <input
            type="text"
            className="form-control"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="mb-4 border rounded p-3 bg-light">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5>
                Field #{index + 1} - {field.config.type}
              </h5>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => removeField(field.id)}
              >
                Remove
              </button>
            </div>
            <FieldBuilder
              config={field.config}
              onChange={(config) => updateField(field.id, config)}
            />
          </div>
        ))}

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="shortFormToggle"
            checked={useShortForm}
            onChange={(e) => setUseShortForm(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="shortFormToggle">
            Show Short Form Only
          </label>
        </div>

        {/* Live Preview */}
        <div className="p-4 border rounded bg-white shadow-sm">
          <h4 className="mb-3">Live Preview</h4>
          <h5>{formTitle}</h5>
          <form onSubmit={handleSubmit}>
            {fields
              .filter((f) => !useShortForm || f.config.displayOnShortForm)
              .map((f) => (
                <FieldRenderer
                  key={f.id}
                  field={f.config}
                  value={formResponses[f.id]}
                  onChange={(val: any) => handleResponseChange(f.id, val)}
                />
              ))}
            <button type="submit" className="btn btn-dark mt-3">
              Submit
            </button>
          </form>
        </div>

        {submittedData && (
          <div className="mt-4">
            <h5>Submitted Data:</h5>
            <pre className="bg-light p-3 border rounded">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Right: Toolbox */}
      <div
        className="toolbox-sidebar bg-white border-start p-3"
        style={{ width: "250px" }}
      >
        <h5 className="mb-3">Toolbox</h5>
        <ul className="list-unstyled">
          {[
            "header",
            "label",
            "paragraph",
            "linebreak",
            "dropdown",
            "tags",
            "checkboxes",
            "multipleChoice",
            "text",
            "number",
          ].map((type) => (
            <li key={type}>
              <button
                className="btn btn-light w-100 mb-2 text-start"
                onClick={() => addField(type as FieldType)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FormBuilder;
