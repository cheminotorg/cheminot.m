package com.cheminotm;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class LocatedStation extends Station {

    private Position pos;

    public LocatedStation(String id, String name, Position pos) {
        super(id, name);
        this.pos = pos;
    }

    public Position getPos() {
        return this.pos;
    }

    public static void sortByDistance(final Position pos, List<LocatedStation> stations) {
        Collections.sort(stations, new Comparator<LocatedStation>() {
            @Override
            public int compare(LocatedStation stationA, LocatedStation stationB) {
                double distanceA = Position.distance(pos, stationA.getPos());
                double distanceB = Position.distance(pos, stationB.getPos());

                if(distanceA < distanceB) {
                    return -1;
                } else if(distanceA == distanceB) {
                    return 0;
                } else {
                    return 1;
                }
            }
        });
    }
}
