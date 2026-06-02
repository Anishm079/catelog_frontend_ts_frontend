import React, { type JSX } from "react";
import Typography from '@mui/material/Typography';
import { Button } from "@mui/material";

interface HeadTypographyProps {
  title: string;
  subtitle?: string;
  buttons?: { label: string | JSX.Element; onClick: () => void }[];
}

const HeadTypography = ({ title, subtitle, buttons }: HeadTypographyProps) => {
  return (
    <div className="flex flex-row items-center justify-between mb-8">
      <span className="text-2xl font-bold">
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {subtitle && <Typography variant="subtitle1" gutterBottom>{subtitle}</Typography>}
      </span>
      <div>
        {buttons &&
          buttons.map((button, index) => (
            <Button variant="contained" color="success" key={index} onClick={button.onClick}>
              {button.label}
            </Button>
          ))}
      </div>
    </div>
  );
};

export default HeadTypography;
