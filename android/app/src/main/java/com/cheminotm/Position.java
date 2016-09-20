package com.cheminotm;

public class Position {

    private Double lat;
    private Double lng;

    private static double EARTH_RADIUS = 6371000;

    public Position(Double lat, Double lng) {
        this.lat = lat;
        this.lng = lng;
    }

    public static Position calculateDerivedPosition(Position pos, double range, double bearing) {
        double latA = Math.toRadians(pos.getLat());
        double lonA = Math.toRadians(pos.getLng());
        double angularDistance = range / EARTH_RADIUS;
        double trueCourse = Math.toRadians(bearing);

        double lat = Math.asin(Math.sin(latA) * Math.cos(angularDistance) +
                               Math.cos(latA) * Math.sin(angularDistance)
                               * Math.cos(trueCourse));

        double dlon = Math.atan2(Math.sin(trueCourse) * Math.sin(angularDistance)
                                 * Math.cos(latA),
                                 Math.cos(angularDistance) - Math.sin(latA) * Math.sin(lat));

        double lon = ((lonA + dlon + Math.PI) % (Math.PI * 2)) - Math.PI;

        lat = Math.toDegrees(lat);
        lon = Math.toDegrees(lon);

        return new Position(lat, lon);
    }

    public static double distance(Position posA, Position posB) {
        double dLat = Math.toRadians(posB.getLat() - posA.getLat());
        double dLng = Math.toRadians(posB.getLng() - posA.getLng());
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(Math.toRadians(posA.getLat())) * Math.cos(Math.toRadians(posB.getLat())) *
            Math.sin(dLng/2) * Math.sin(dLng/2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS * c;
    }

    public Double getLng() {
        return lng;
    }

    public Double getLat() {
        return lat;
    }
}
