var asDate = (time: string) => {
  var today = new Date();
  return new Date(Date.parse(today.toDateString() + ' ' + time));
}

export function init(success: (version: string) => void, error: (err: string) => void): void {
  success("XXXXXXXX");
}

export function lookForBestTrip (vsId: string, veId: string, at: Date, te: Date, max: number, success: (stopTimes: ArrivalTime[]) => void, error: (err: string) => void): void {
  var leMansParis = [
    {
      stopId: 'StopPoint:OCETrain TER-87396002',
      stopName: 'Le Mans',
      arrival: asDate('06:32:00'),
      departure: asDate('06:32:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 0
    },
    {
      stopId: 'StopPoint:OCETrain TER-87396309',
      stopName: 'Connerré-Beillé',
      arrival: asDate('06:44:00'),
      departure: asDate('06:45:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 1
    },
    {
      stopId: 'StopPoint:OCETrain TER-87396325',
      stopName: 'La Ferté-Bernard',
      arrival: asDate('06:56:00'),
      departure: asDate('06:57:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 2
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394296',
      stopName: 'Nogent-le-Rotrou',
      arrival: asDate('07:08:00'),
      departure: asDate('07:09:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 3
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394254',
      stopName: 'La Loupe',
      arrival: asDate('07:23:00'),
      departure: asDate('07:24:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 4
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394221',
      stopName: 'Courville-sur-Eure',
      arrival: asDate('07:34:00'),
      departure: asDate('07:35:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 5
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394007',
      stopName: 'Chartres',
      arrival: asDate('07:46:00'),
      departure: asDate('07:57:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 6
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394130',
      stopName: 'Maintenon',
      arrival: asDate('08:09:00'),
      departure: asDate('08:10:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 7
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394114',
      stopName: 'Epernon',
      arrival: asDate('08:16:00'),
      departure: asDate('08:17:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 8
    },
    {
      stopId: 'StopPoint:OCETrain TER-87393314',
      stopName: 'Rambouillet',
      arrival: asDate('08:29:00'),
      departure: asDate('08:31:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 9
    },
    {
      stopId: 'StopPoint:OCETrain TER-87393009',
      stopName: 'Versailles-Chantiers',
      arrival: asDate('08:51:00'),
      departure: asDate('08:53:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 10
    },
    {
      stopId: 'StopPoint:OCETrain TER-87391003',
      stopName: 'Paris-Montparnasse 1-2',
      arrival: asDate('09:05:00'),
      departure: asDate('09:05:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 11
    }
  ];
  window.setTimeout(function() {
    success(leMansParis);
  }, 500);
}
