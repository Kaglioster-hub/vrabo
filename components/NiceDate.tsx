"use client";
import "react-datepicker/dist/react-datepicker.css";
import React from "react";
import DatePicker from "react-datepicker";
import { it } from "date-fns/locale";

type SingleProps = React.ComponentProps<typeof DatePicker>;
export function SingleDate(p: Omit<SingleProps,"locale">) {
  return (
    <DatePicker
      locale={it}
      calendarStartDay={1}
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      showPopperArrow={false}
      portalId="vrabo-portal"
      popperClassName="dp-popper"
      className="input w-full"
      dateFormat="dd/MM/yyyy"
      {...p}
    />
  );
}
type RangeProps = React.ComponentProps<typeof DatePicker>;
export function RangeDate(p: Omit<RangeProps,"locale"|"selectsRange"> & {startDate: Date|null; endDate: Date|null}) {
  return (
    <DatePicker
      locale={it}
      selectsRange
      calendarStartDay={1}
      monthsShown={2}
      showPopperArrow={false}
      portalId="vrabo-portal"
      popperClassName="dp-popper"
      className="input w-full"
      dateFormat="dd/MM/yyyy"
      {...p}
    />
  );
}

