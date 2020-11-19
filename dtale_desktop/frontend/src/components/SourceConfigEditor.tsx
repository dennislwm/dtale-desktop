import React, { useState } from "react";
import styled from "styled-components";
import { Drawer, Button, Input, Alert, notification } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { ActionDispatch, setSelectedSource } from "../store/actions";
import { createSource, updateSource } from "../store/backend";
import { Source } from "../store/state";
import { PythonEditor } from "./PythonEditor";

const Label = styled.div`
  margin-top: 5;
  margin-bottom: 5;
`;

const Editor: React.FC<{
  source: Source;
  clone: Source;
  mode: "edit" | "new";
  dispatch: ActionDispatch;
}> = ({ source, clone, mode, dispatch }) => {
  const [error, setError] = useState<string | null>(null);

  const checkRequired = (): boolean => {
    const requiredFields = ["name", "listPaths", "getData"] as const;
    const missing = requiredFields.filter((f) => !clone[f]);
    if (missing.length > 0) {
      setError(`Fill out the required fields: ${missing.join(", ")}`);
      return false;
    } else if (
      mode === "edit" &&
      requiredFields.every((f) => clone[f] === source[f])
    ) {
      setError("No changes were made");
      return false;
    } else {
      return true;
    }
  };

  return (
    <Drawer
      title={mode === "new" ? "Add Data Source" : "Data Source"}
      width={800}
      onClose={() => dispatch(setSelectedSource(null))}
      visible={true}
      footer={
        source.editable ? (
          <Button
            type="primary"
            block
            onClick={() => {
              if (checkRequired()) {
                if (mode === "new") {
                  createSource(dispatch, clone, setError);
                } else {
                  updateSource(dispatch, clone, setError);
                }
              }
            }}
          >
            {mode === "new" ? "Create source" : "Save changes"}
          </Button>
        ) : null
      }
    >
      {error ? (
        <Alert
          type="error"
          message={error}
          closable
          onClose={() => setError(null)}
        />
      ) : null}
      {mode === "new" ? null : (
        <Input
          style={{ marginTop: 5, marginBottom: 5 }}
          disabled={true}
          defaultValue={clone.packagePath}
          size="small"
          addonBefore="Package"
          addonAfter={
            <CopyOutlined
              onClick={() =>
                navigator.clipboard.writeText(clone.packagePath).then(() =>
                  notification.open({
                    message: "Copied to clipboard!",
                    duration: 1,
                  })
                )
              }
            />
          }
        />
      )}
      <Input
        style={{ marginTop: 5, marginBottom: 5 }}
        addonBefore="Name"
        disabled={!source.editable}
        defaultValue={clone.name}
        onChange={(e) => {
          clone.name = e.target.value;
        }}
        size="small"
      />
      <Label>list_paths.py</Label>
      <PythonEditor
        readOnly={!source.editable}
        name="list_paths_code"
        value={clone.listPaths}
        onChange={(v) => {
          clone.listPaths = v;
        }}
        width="100%"
      />
      <Label>get_data.py</Label>
      <PythonEditor
        readOnly={!source.editable}
        name="get_data_code"
        value={clone.getData}
        onChange={(v) => {
          clone.getData = v;
        }}
        width="100%"
      />
    </Drawer>
  );
};

// Wrapping the main component to fix some bugs from when errors occur, should probably clean this up.
export const SourceConfigEditor: React.FC<{
  source: Source;
  dispatch: ActionDispatch;
}> = ({ source, dispatch }) => (
  <Editor
    source={source}
    clone={{ ...source }}
    mode={source.name !== "" ? "edit" : "new"}
    dispatch={dispatch}
  />
);
