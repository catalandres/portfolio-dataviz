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
    const adr = reservation.adr;
    const stayDuration = reservation.stays_in_weekend_nights + reservation.stays_in_week_nights;

    if (!acc[date]) {
        acc[date] = {
            "Resort Hotel": { "adrSum": 0, "adrCount": 0 },
            "City Hotel": { "adrSum": 0, "adrCount": 0 }
        };
    }

    acc[date][hotel]["adrSum"] += adr;
    acc[date][hotel]["adrCount"] += 1;

    return acc;
}, {});

const timeHistogram = Object.entries(frequencyTable).map(([date, hotels]) => {
    return {
        date: new Date(date),
        cityAvgAdr: hotels["City Hotel"]["adrSum"] / hotels["City Hotel"]["adrCount"],
        resortAvgAdr: hotels["Resort Hotel"]["adrSum"] / hotels["Resort Hotel"]["adrCount"],
    };
});
```

## Tarifa mitjana diària
<div class="grid grid-cols-2">
  <div class="card">
    ${resize((width) => Plot.plot({
        title: "Tarifa mitjana diària (ADR)",
        subtitle: "Hotel urbà",
        padding: 0,
        x: {axis: null},
        y: {tickFormat: Plot.formatWeekday("ca", "narrow"), tickSize: 0},
        fy: {tickFormat: ""},
        color: {scheme: "YlGn", legend: true, tickFormat: cat.format("$.0f"), domain: [0, 200]},
        marks: [
            Plot.cell(timeHistogram, {
            x: (d) => d3.utcWeek.count(d3.utcYear(d.date), d.date),
            y: (d) => d.date.getUTCDay(),
            fy: (d) => d.date.getUTCFullYear(),
            fill: (d, i) => d["cityAvgAdr"],
            title: (d, i) => d["cityAvgAdr"],
            inset: 0.5
            })
        ]
    }))}
  </div>
  <div class="card">
    ${resize((width) => Plot.plot({
        title: "Tarifa mitjana diària (ADR)",
        subtitle: "Hotel de resort",
        padding: 0,
        x: {axis: null},
        y: {tickFormat: Plot.formatWeekday("ca", "narrow"), tickSize: 0},
        fy: {tickFormat: ""},
        color: {scheme: "YlGn", legend: true, tickFormat: cat.format("$.0f"), domain: [0, 200]},
        marks: [
            Plot.cell(timeHistogram, {
            x: (d) => d3.utcWeek.count(d3.utcYear(d.date), d.date),
            y: (d) => d.date.getUTCDay(),
            fy: (d) => d.date.getUTCFullYear(),
            fill: (d, i) => d["resortAvgAdr"],
            title: (d, i) => d["resortAvgAdr"],
            inset: 0.5
            })
        ]
    }))}
  </div>
</div>

- L’hotel urbà, amb tarifes més estables, pot centrar-se a optimitzar marges i adreçar-se a la clientela corporativa i de negocis.
- El _resort_, sotmès a fortes estacionalitats, ha de maximitzar ingressos aprofitant la gran demanda en períodes punta i ajustant preus de manera intel·ligent a la baixa en temporades més fluixes.
