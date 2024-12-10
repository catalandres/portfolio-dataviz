--- 
theme: "dashboard"
toc.show: false
---

# OptiReserve GTM

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
        cityReservations: hotels["City Hotel"]["Check-Out"] + hotels["City Hotel"]["Canceled"] + hotels["City Hotel"]["No-Show"],
        resortReservations: hotels["Resort Hotel"]["Check-Out"] + hotels["Resort Hotel"]["Canceled"] + hotels["Resort Hotel"]["No-Show"],
    };
});
```

## Volum d'arribades

<div class="grid grid-cols-2">
  <div class="card">
    ${resize((width) => Plot.plot({
        title: "Volum d'arribades diàries",
        subtitle: "Hotel urbà",
        padding: 0,
        x: {axis: null},
        y: {tickFormat: Plot.formatWeekday("ca", "narrow"), tickSize: 0},
        fy: {tickFormat: ""},
        color: {scheme: "Oranges", legend: true, domain: [0, 200]},
        marks: [
            Plot.cell(timeHistogram, {
            x: (d) => d3.utcWeek.count(d3.utcYear(d.date), d.date),
            y: (d) => d.date.getUTCDay(),
            fy: (d) => d.date.getUTCFullYear(),
            fill: (d, i) => d["cityReservations"],
            title: (d, i) => d["cityReservations"],
            inset: 0.5
            })
        ]
    }))}
  <div><p>Les arribades a l’hotel urbà són <b>regularment freqüents</b>. Poden aprofitar aquesta regularitat per planificar torns i inventari amb més precisió.</p></div>
  </div>
  <div class="card">
    ${resize((width) => Plot.plot({
        title: "Volum d'arribades diàries",
        subtitle: "Hotel de resort",
        padding: 0,
        x: {axis: null},
        y: {tickFormat: Plot.formatWeekday("ca", "narrow"), tickSize: 0},
        fy: {tickFormat: ""},
        color: {scheme: "Oranges", legend: true, domain: [0, 200]},
        marks: [
            Plot.cell(timeHistogram, {
            x: (d) => d3.utcWeek.count(d3.utcYear(d.date), d.date),
            y: (d) => d.date.getUTCDay(),
            fy: (d) => d.date.getUTCFullYear(),
            fill: (d, i) => d["resortReservations"],
            title: (d, i) => d["resortReservations"],
            inset: 0.5
            })
        ]
    }))}
    <div><p>El resort concentra les arribades al voltant dels <b>caps de setmana</b>, amb major volum a la <b>primavera</b> i a la <b>tardor</b>.</p><p>A l'estiu, el nivell més baix d'arribades es juxtaposa amb una durada mitjana de l'estada més llarga.</p></div>
  </div>
</div>
