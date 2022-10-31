const InterpolatedRates = {
  3: 3,
  6: 3.33,
  12: 4.0,
  18: 4.1,
  24: 4.2,
  30: 4.35,
  36: 4.5,
  42: 4.75,
  48: 5.0,
};

export class Bond {
  startDate: Date;
  endDate: Date;
  periodic: number;
  interestRate: number;
  nominalValue: number;

  constructor(SD: Date, ED: Date, periodic: number, IR: number, NV: number) {
    this.startDate = SD;
    this.endDate = ED;
    this.periodic = periodic;
    this.interestRate = IR / 100;
    this.nominalValue = NV;
  }

  Maturity(startDate: Date, endDate: Date) {
    let months;
    months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months -= startDate.getMonth();
    months += endDate.getMonth();
    return months <= 0 ? 0 : months;
  }

  Days360(startDate: Date, endDate: Date, method?: boolean) {
    let d1 = new Date(startDate);
    let d2 = new Date(endDate);

    let d1_y = d1.getFullYear();
    let d2_y = d2.getFullYear();
    let dy = 0;
    let d1_m = d1.getMonth();
    let d2_m = d2.getMonth();
    let dm = 0;
    let d1_d = d1.getDate();
    let d2_d = d2.getDate();
    let dd = 0;
    if (method) {
      // euro
      if (d1_d == 31) d1_d = 30;
      if (d2_d == 31) d2_d = 30;
    } else {
      // american NASD
      if (d1_d == 31) d1_d = 30;
      if (d2_d == 31) {
        if (d1_d < 30) {
          if (d2_m == 11) {
            d2_y = d2_y + 1;
            d2_m = 0;
            d2_d = 1;
          } else {
            d2_m = d2_m + 1;
            d2_d = 1;
          }
        } else {
          d2_d = 30;
        }
      }
    }
    dy = d2_y - d1_y;
    dm = d2_m - d1_m;
    dd = d2_d - d1_d;
    return dy * 360 + dm * 30 + dd;
  }

  Calculations() {
    let maturity = this.Maturity(this.startDate, this.endDate);
    let datesCount = maturity / this.periodic;

    let redemptionArray: number[] = [];
    let valueArray: number[] = [];

    for (let i = 1; i <= datesCount; i++) {
      let redemption = 0;

      if (i === datesCount) redemption = this.nominalValue;
      redemptionArray.push(redemption);
      let timeInMonths = i * this.periodic;

      let newDate = new Date(this.startDate);
      newDate.setMonth(this.startDate.getMonth() + timeInMonths);

      let oneYBeforeDate = new Date(this.startDate);
      oneYBeforeDate.setFullYear(oneYBeforeDate.getFullYear() - 1);

      let dTPeriod: number = this.Days360(oneYBeforeDate, this.startDate) / 360;

      let capital: number =
        i !== 1
          ? this.nominalValue - redemptionArray[i - 2]
          : this.nominalValue;
      let interestRatePayments: number = capital * dTPeriod * this.interestRate;
      let totalPayment: number = interestRatePayments + redemption;

      const distance = this.Days360(this.startDate, newDate) / 360;
      type ObjectKey = keyof typeof InterpolatedRates;
      let discountFactor =
        1 /
        (1 + (distance * InterpolatedRates[timeInMonths as ObjectKey]) / 100);
      let value = discountFactor * totalPayment;
      valueArray.push(value);

      console.log(
        "FOR DATE: " +
          newDate.toISOString() +
          "\n" +
          "Redemption is " +
          redemption +
          "\n" +
          "Capital is " +
          capital +
          "\n" +
          "dT Period is " +
          dTPeriod +
          "\n" +
          "Interest Rate Payment is " +
          interestRatePayments +
          "\n" +
          "Total Payment is " +
          totalPayment +
          "\n" +
          "Distance is " +
          distance +
          "\n" +
          "Discount factor is " +
          discountFactor +
          "\n" +
          "Value is " +
          value
      );
    }

    let sumValue = valueArray.reduce((acc, value) => {
      return acc + value;
    }, 0);
    console.log("Summed value is " + sumValue); // Not finished
  }
}
