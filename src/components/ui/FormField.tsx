import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import styles from "./FormField.module.css";

interface FieldShellProps {
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  span2?: boolean;
  children: ReactNode;
}

export function FieldShell({ label, required, help, error, span2, children }: FieldShellProps) {
  return (
    <label className={`${styles.field}${span2 ? ` ${styles.span2}` : ""}`}>
      <span className={styles.label}>
        {label}
        {required ? <span className={styles.required}>*</span> : null}
      </span>
      {children}
      {error ? <span className={styles.error}>{error}</span> : help ? <span className={styles.help}>{help}</span> : null}
    </label>
  );
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  span2?: boolean;
  endAdornment?: ReactNode;
}

export function InputField({ label, required, help, error, span2, className, endAdornment, ...rest }: InputFieldProps) {
  const inputEl = <input className={`${styles.input}${className ? ` ${className}` : ""}`} {...rest} />;
  return (
    <FieldShell label={label} required={required} help={help} error={error} span2={span2}>
      {endAdornment ? (
        <span className={styles.inputShell}>
          {inputEl}
          {endAdornment}
        </span>
      ) : (
        inputEl
      )}
    </FieldShell>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  span2?: boolean;
  children: ReactNode;
}

export function SelectField({ label, required, help, error, span2, className, children, ...rest }: SelectFieldProps) {
  return (
    <FieldShell label={label} required={required} help={help} error={error} span2={span2}>
      <select className={`${styles.input}${className ? ` ${className}` : ""}`} {...rest}>
        {children}
      </select>
    </FieldShell>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  span2?: boolean;
}

export function TextAreaField({ label, required, help, error, span2, className, rows = 3, ...rest }: TextAreaFieldProps) {
  return (
    <FieldShell label={label} required={required} help={help} error={error} span2={span2}>
      <textarea rows={rows} className={`${styles.textarea}${className ? ` ${className}` : ""}`} {...rest} />
    </FieldShell>
  );
}
