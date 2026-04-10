import axios from "axios";
import { useState } from "react";

const initialState = {
  status: "idle",
  data: null,
  error: null,
};

export function useAnalysis() {
  const [state, setState] = useState(initialState);

  const analyze = async ({ passage, question, aiResponse }) => {
    setState({ status: "loading", data: null, error: null });

    try {
      const response = await axios.post("http://localhost:8000/analyze", {
        passage,
        question,
        ai_response: aiResponse,
      });

      setState({ status: "success", data: response.data, error: null });
    } catch (error) {
      setState({
        status: "error",
        data: null,
        error: error.response?.data?.detail ?? "Request failed.",
      });
    }
  };

  const reset = () => setState(initialState);

  return { ...state, analyze, reset };
}
