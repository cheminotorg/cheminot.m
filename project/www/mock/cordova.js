window.cordova = {
    isMock: true,
    plugins: {
        SoftKeyboard: {
            hide: function(success, error) {
                success && success();
            },
            show: function(success, error) {
                success && success();
            }
        },
        Cheminot: {
            lookForBestTrip: function (start, end, at, success, error) {
                function asDate(time) {
                    var today = new Date();
                    return new Date(Date.parse(today.toDateString() + ' ' + time));
                }
                var leMansParis = [
                    {
                        stopId: 'StopPoint:OCETrain TER-87396002',
                        stopName: 'Le Mans',
                        arrivalTime: asDate('06:32:00'),
                        departureTime: asDate('06:32:00'),
                        tripId: 'OCESN016756F0100230477',
                        pos: 0
                    },
                    {
                        stopId: 'StopPoint:OCETrain TER-87396309',
                        stopName: 'Connerré-Beillé',
                        arrivalTime: asDate('06:44:00'),
                        departureTime: asDate('06:45:00'),
                        tripId: 'OCESN016756F0100230477',
                        pos: 1
                    },
                    {
                        stopId: 'StopPoint:OCETrain TER-87396325',
                        stopName: 'La Ferté-Bernard',
                        arrivalTime: asDate('06:56:00'),
                        departureTime: asDate('06:57:00'),
                        tripId: 'OCESN016756F0100230477',
                        pos: 2
                    },
                    {
                        stopId: 'StopPoint:OCETrain TER-87394296',
                        stopName: 'Nogent-le-Rotrou',
                        arrivalTime: asDate('07:08:00'),
                        departureTime: asDate('07:09:00'),
                        tripId: 'OCESN016756F0100230477',
                        pos: 3
                    },
                    {
                        stopId: 'StopPoint:OCETrain TER-87394254',
                        stopName: 'La Loupe',
                        arrivalTime: asDate('07:23:00'),
                        departureTime: asDate('07:24:00'),
                        tripId: 'OCESN016756F0100230477',
                        pos: 4
                    },
                    {
                        stopId: 'StopPoint:OCETrain TER-87394221',
                        stopName: 'Courville-sur-Eure',
                        arrivalTime: asDate('07:34:00'),
                        departureTime: asDate('07:35:00'),
                        tripId: 'OCESN016756F0100230477',
                        pos: 5
                    },
                    {
                        stopId: 'StopPoint:OCETrain TER-87394007',
                        stopName: 'Chartres',
                        arrivalTime: asDate('07:46:00'),
                        departureTime: asDate('07:57:00'),
                        tripId: 'OCESN016756F0100230477',
                        pos: 6
                    },
                    {
                        stopId: 'StopPoint:OCETrain TER-87394130',
                        stopName: 'Maintenon',
                        arrivalTime: asDate('08:09:00'),
                        departureTime: asDate('08:10:00'),
                        tripId: 'OCESN016756F0100230477',
                        pos: 7
                    },
                    {
                        stopId: 'StopPoint:OCETrain TER-87394114',
                        stopName: 'Epernon',
                        arrivalTime: asDate('08:16:00'),
                        departureTime: asDate('08:17:00'),
                        tripId: 'OCESN016756F0100230477',
                        pos: 8
                    },
                    {
                        stopId: 'StopPoint:OCETrain TER-87393314',
                        stopName: 'Rambouillet',
                        arrivalTime: asDate('08:29:00'),
                        departureTime: asDate('08:31:00'),
                        tripId: 'OCESN016756F0100230477',
                        pos: 9
                    },
                    {
                        stopId: 'StopPoint:OCETrain TER-87393009',
                        stopName: 'Versailles-Chantiers',
                        arrivalTime: asDate('08:51:00'),
                        departureTime: asDate('08:53:00'),
                        tripId: 'OCESN016756F0100230477',
                        pos: 10
                    },
                    {
                        stopId: 'StopPoint:OCETrain TER-87391003',
                        stopName: 'Paris-Montparnasse 1-2',
                        arrivalTime: asDate('09:05:00'),
                        departureTime: asDate('09:05:00'),
                        tripId: 'OCESN016756F0100230477',
                        pos: 11
                    }
                ];
                window.setTimeout(function() {
                    success(leMansParis);
                }, 500);
            }
        }
    }
};
