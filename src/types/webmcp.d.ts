import "react";

type WebMCPFormAttributes = {
  toolname?: string;
  tooldescription?: string;
  toolautosubmit?: boolean;
};

type WebMCPParamAttributes = {
  toolparamdescription?: string;
};

declare module "react" {
  interface FormHTMLAttributes<T> extends WebMCPFormAttributes {}
  interface InputHTMLAttributes<T> extends WebMCPParamAttributes {}
  interface SelectHTMLAttributes<T> extends WebMCPParamAttributes {}
  interface TextareaHTMLAttributes<T> extends WebMCPParamAttributes {}
}