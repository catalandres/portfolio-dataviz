--- 
theme: "dashboard"
toc.show: false
---

# Hotels

```js
import { DateTime } from "luxon";

const cat = d3.formatLocale({
  thousands: ",",
  grouping: [3],
  currency: ["", "€"]
});

const monthMap = {
    "January": 1,
    "February": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "August": 8,
    "September": 9,
    "October": 10,
    "November": 11,
    "December": 12
};

const reservations = await FileAttachment("data/hotel_bookings-clean.csv")
        .csv({typed: true, array: false})
        .then(data => data.map(d => {
            d.arrivalDate = DateTime.fromObject({
                    year: d.arrival_date_year, 
                    month: monthMap[d.arrival_date_month], 
                    day: d.arrival_date_day_of_month
            },{
                zone: "Europe/Lisbon"
            });
            return d;
        }))

const frequencyTable = reservations.reduce((acc, reservation) => {
    const date = reservation.arrivalDate.toJSDate();
    const hotel = reservation.hotel;
    const status = reservation.reservation_status;

    if (!acc[date]) {
        acc[date] = {
            "Resort Hotel": { "Canceled": 0, "Check-Out": 0, "No-Show": 0 },
            "City Hotel": { "Canceled": 0, "Check-Out": 0, "No-Show": 0 }
        };
    }

    acc[date][hotel][status] += 1;

    return acc;
}, {});

const timeHistogram = Object.entries(frequencyTable).map(([date, hotels]) => {
    return {
        date: new Date(date),
        cityNonCheckoutRatio: (hotels["City Hotel"]["Canceled"] + hotels["City Hotel"]["No-Show"]) / (hotels["City Hotel"]["Check-Out"] + hotels["City Hotel"]["Canceled"] + hotels["City Hotel"]["No-Show"]),
        resortNonCheckoutRatio: (hotels["Resort Hotel"]["Canceled"] + hotels["Resort Hotel"]["No-Show"]) / (hotels["Resort Hotel"]["Check-Out"] + hotels["Resort Hotel"]["Canceled"] + hotels["Resort Hotel"]["No-Show"]),
    };
});
```

## Reserves fallides

<div class="grid grid-cols-2">
  <div class="card">
    ${resize((width) => Plot.plot({
        title: "Percentatge de reserves sense checkout",
        subtitle: "Hotel urbà",
        padding: 0,
        x: {axis: null},
        y: {tickFormat: Plot.formatWeekday("ca", "narrow"), tickSize: 0},
        fy: {tickFormat: ""},
        color: {scheme: "Purples", legend: true, tickFormat: "%", domain: [0, 1]},
        marks: [
            Plot.cell(timeHistogram, {
            x: (d) => d3.utcWeek.count(d3.utcYear(d.date), d.date),
            y: (d) => d.date.getUTCDay(),
            fy: (d) => d.date.getUTCFullYear(),
            fill: (d, i) => d["cityNonCheckoutRatio"],
            title: (d, i) => d["cityNonCheckoutRatio"],
            inset: 0.5
            })
        ]
    }))}
  </div>
  <div class="card">
    ${resize((width) => Plot.plot({
        title: "Percentatge de reserves sense checkout",
        subtitle: "Hotel de resort",
        padding: 0,
        x: {axis: null},
        y: {tickFormat: Plot.formatWeekday("ca", "narrow"), tickSize: 0},
        fy: {tickFormat: ""},
        color: {scheme: "Purples", legend: true, tickFormat: "%", domain: [0, 1]},
        marks: [
            Plot.cell(timeHistogram, {
            x: (d) => d3.utcWeek.count(d3.utcYear(d.date), d.date),
            y: (d) => d.date.getUTCDay(),
            fy: (d) => d.date.getUTCFullYear(),
            fill: (d, i) => d["resortNonCheckoutRatio"],
            title: (d, i) => d["resortNonCheckoutRatio"],
            inset: 0.5
            })
        ]
    }))}
  </div>
</div>

- Les cancel·lacions i els _no-shows_ erosionen els marges dels hotels.
- L'hotel urbà pateix més cancel·lacions i _no-shows_ com a percentatge del total de reserves.
- Per al _resort_, una reserva fallida és més significativa, ja que suposa una pèrdua d'ingressos major: un número de nits més alt a una tarifa més alta.
