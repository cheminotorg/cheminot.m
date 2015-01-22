var asTimestamp = (time: string) => {
  var today = new Date();
  return Date.parse(today.toDateString() + ' ' + time);
}

export function init(success: (version: string) => void, error: (err: string) => void): void {
  success("XXXXXXXX");
}

export function lookForBestTrip (vsId: string, veId: string, at: number, te: number, max: number, success: (stopTimes: ArrivalTime[]) => void, error: (err: string) => void): void {
  var leMansParis = [
    {
      stopId: 'StopPoint:OCETrain TER-87396002',
      stopName: 'Le Mans',
      arrival: asTimestamp('06:32:00'),
      departure: asTimestamp('06:32:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 0
    },
    {
      stopId: 'StopPoint:OCETrain TER-87396309',
      stopName: 'Connerré-Beillé',
      arrival: asTimestamp('06:44:00'),
      departure: asTimestamp('06:45:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 1
    },
    {
      stopId: 'StopPoint:OCETrain TER-87396325',
      stopName: 'La Ferté-Bernard',
      arrival: asTimestamp('06:56:00'),
      departure: asTimestamp('06:57:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 2
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394296',
      stopName: 'Nogent-le-Rotrou',
      arrival: asTimestamp('07:08:00'),
      departure: asTimestamp('07:09:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 3
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394254',
      stopName: 'La Loupe',
      arrival: asTimestamp('07:23:00'),
      departure: asTimestamp('07:24:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 4
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394221',
      stopName: 'Courville-sur-Eure',
      arrival: asTimestamp('07:34:00'),
      departure: asTimestamp('07:35:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 5
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394007',
      stopName: 'Chartres',
      arrival: asTimestamp('07:46:00'),
      departure: asTimestamp('07:57:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 6
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394130',
      stopName: 'Maintenon',
      arrival: asTimestamp('08:09:00'),
      departure: asTimestamp('08:10:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 7
    },
    {
      stopId: 'StopPoint:OCETrain TER-87394114',
      stopName: 'Epernon',
      arrival: asTimestamp('08:16:00'),
      departure: asTimestamp('08:17:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 8
    },
    {
      stopId: 'StopPoint:OCETrain TER-87393314',
      stopName: 'Rambouillet',
      arrival: asTimestamp('08:29:00'),
      departure: asTimestamp('08:31:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 9
    },
    {
      stopId: 'StopPoint:OCETrain TER-87393009',
      stopName: 'Versailles-Chantiers',
      arrival: asTimestamp('08:51:00'),
      departure: asTimestamp('08:53:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 10
    },
    {
      stopId: 'StopPoint:OCETrain TER-87391003',
      stopName: 'Paris-Montparnasse 1-2',
      arrival: asTimestamp('09:05:00'),
      departure: asTimestamp('09:05:00'),
      tripId: 'OCESN016756F0100230477',
      pos: 11
    }
  ];
  window.setTimeout(function() {
    success(leMansParis);
  }, 500);
}
