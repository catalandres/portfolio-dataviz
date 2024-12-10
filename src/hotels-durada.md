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
    const stayDuration = reservation.stays_in_weekend_nights + reservation.stays_in_week_nights;

    if (!acc[date]) {
        acc[date] = {
            "Resort Hotel": { "staySum": 0, "stayCount": 0 },
            "City Hotel": { "staySum": 0, "stayCount": 0 }
        };
    }
    acc[date][hotel]["staySum"] += stayDuration;
    acc[date][hotel]["stayCount"] += 1;

    return acc;
}, {});

const timeHistogram = Object.entries(frequencyTable).map(([date, hotels]) => {
    return {
        date: new Date(date),
        cityAvgStay: hotels["City Hotel"]["staySum"] / hotels["City Hotel"]["stayCount"],
        resortAvgStay: hotels["Resort Hotel"]["staySum"] / hotels["Resort Hotel"]["stayCount"]
    };
});
```

## Durada de l'estada
<div class="grid grid-cols-2">
  <div class="card">
    ${resize((width) => Plot.plot({
        title: "Durada mitjana de l'estada",
        subtitle: "Hotel urbà",
        padding: 0,
        x: {axis: null},
        y: {tickFormat: Plot.formatWeekday("ca", "narrow"), tickSize: 0},
        fy: {tickFormat: ""},
        color: {scheme: "Blues", legend: true, label: "Durada mitjana", domain: [0, 15]},
        marks: [
            Plot.cell(timeHistogram, {
            x: (d) => d3.utcWeek.count(d3.utcYear(d.date), d.date),
            y: (d) => d.date.getUTCDay(),
            fy: (d) => d.date.getUTCFullYear(),
            fill: (d, i) => d["cityAvgStay"],
            title: (d, i) => d["cityAvgStay"],
            inset: 0.5
            })
        ]
    }))}
  </div>
  <div class="card">
    ${resize((width) => Plot.plot({
        title: "Durada mitjana de l'estada",
        subtitle: "Hotel de resort",
        padding: 0,
        x: {axis: null},
        y: {tickFormat: Plot.formatWeekday("ca", "narrow"), tickSize: 0},
        fy: {tickFormat: ""},
        color: {scheme: "Blues", legend: true, label: "Durada mitjana", domain: [0, 15]},
        marks: [
            Plot.cell(timeHistogram, {
            x: (d) => d3.utcWeek.count(d3.utcYear(d.date), d.date),
            y: (d) => d.date.getUTCDay(),
            fy: (d) => d.date.getUTCFullYear(),
            fill: (d, i) => d["resortAvgStay"],
            title: (d, i) => d["resortAvgStay"],
            inset: 0.5
            })
        ]
    }))}
  </div>
</div>

- A l'hotel de _resort_ les estades són més llargues, i la variabilitat és més gran, lligada a la clientela de lleure i la temporada estival.
- A l'hotel urbà, la durada mitjana de l'estada és més estable, amb una mitjana més baixa, associada a un públic més transitori i de negocis.