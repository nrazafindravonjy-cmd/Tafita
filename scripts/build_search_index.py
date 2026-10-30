"""Builds the map search index from an `osmium export -f geojsonseq` of Madagascar.

Usage: python3 scripts/build_search_index.py input.geojsonseq app/public/search-index.json

Each entry is [name, lat, lng, kind, rank] with an optional bbox
[south, north, west, east] for areas. Lower ranks are more prominent.
"""

import json
import sys

# (tag, value or None for any value) -> rank. Order matters: first match wins.
KINDS = [
    (("place", "city"), 0),
    (("place", "town"), 1),
    (("boundary", "national_park"), 1),
    (("place", "island"), 2),
    (("leisure", "nature_reserve"), 2),
    (("boundary", "protected_area"), 2),
    (("place", "village"), 3),
    (("place", "suburb"), 3),
    (("natural", "beach"), 3),
    (("natural", "peak"), 3),
    (("natural", "volcano"), 3),
    (("natural", "bay"), 3),
    (("natural", "cape"), 3),
    (("waterway", "waterfall"), 3),
    (("tourism", "attraction"), 3),
    (("tourism", "museum"), 3),
    (("tourism", "viewpoint"), 3),
    (("historic", None), 3),
    (("aeroway", "aerodrome"), 3),
    (("place", "islet"), 4),
    (("place", "hamlet"), 4),
    (("place", "quarter"), 4),
    (("place", "neighbourhood"), 4),
    (("place", "locality"), 4),
    (("natural", "cave_entrance"), 4),
    (("tourism", "hotel"), 4),
    (("tourism", "guest_house"), 4),
    (("tourism", "hostel"), 4),
    (("tourism", "camp_site"), 4),
    (("leisure", "park"), 4),
    (("amenity", "marketplace"), 4),
    (("amenity", "restaurant"), 5),
    (("amenity", "cafe"), 5),
    (("amenity", "bar"), 5),
]


def classify(tags):
    for (key, value), rank in KINDS:
        tag = tags.get(key)
        if tag is not None and (value is None or tag == value):
            return (value or tag), rank
    return None


def flatten(coordinates):
    if coordinates and isinstance(coordinates[0], (int, float)):
        yield coordinates
        return
    for part in coordinates:
        yield from flatten(part)


def main(source, target):
    groups = {}
    with open(source, encoding="utf-8") as lines:
        for line in lines:
            # geojsonseq lines may start with the RS separator character.
            line = line.strip().lstrip("\x1e")
            if not line:
                continue
            feature = json.loads(line)
            tags = feature.get("properties") or {}
            name = tags.get("name")
            kind = classify(tags)
            if not name or not kind:
                continue
            points = list(flatten(feature["geometry"]["coordinates"]))
            lngs = [point[0] for point in points]
            lats = [point[1] for point in points]
            south, north, west, east = min(lats), max(lats), min(lngs), max(lngs)
            lat, lng = round((south + north) / 2, 5), round((west + east) / 2, 5)
            entry = [name, lat, lng, kind[0], kind[1]]
            if feature["geometry"]["type"] != "Point" and (north - south > 0.001 or east - west > 0.001):
                entry.append([round(south, 5), round(north, 5), round(west, 5), round(east, 5)])
            # The same place is often mapped both as a node and as an area:
            # keep one per name and kind within ~10 km, preferring the area.
            twins = groups.setdefault((name, kind[0]), [])
            twin = next((t for t in twins if abs(t[1] - lat) < 0.1 and abs(t[2] - lng) < 0.1), None)
            if twin is None:
                twins.append(entry)
            elif len(entry) > len(twin):
                twins[twins.index(twin)] = entry
    entries = [entry for twins in groups.values() for entry in twins]
    entries.sort(key=lambda entry: (entry[4], entry[0]))
    with open(target, "w", encoding="utf-8") as output:
        json.dump(entries, output, ensure_ascii=False, separators=(",", ":"))
    print(f"{len(entries)} places written to {target}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
