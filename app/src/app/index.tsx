import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";

import { Button } from "@/components/form";
import { PlaceDetails } from "@/components/place-details";
import { PlacesMap } from "@/components/places-map";
import { ProposePlace } from "@/components/propose-place";
import { Screen } from "@/components/screen";
import { ThemedText } from "@/components/themed-text";
import { neon } from "@/lib/neon";
import { fetchPlaceMarkers, type PlaceMarker } from "@/lib/places";

type Location = { lat: number; lng: number };

export default function MapScreen() {
  const { t } = useTranslation();
  const session = neon.auth.useSession();
  const userId = session.data?.user.id;
  const [places, setPlaces] = useState<PlaceMarker[]>([]);
  const [failed, setFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [proposing, setProposing] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<Location | null>(null);

  useEffect(() => {
    fetchPlaceMarkers()
      .then(setPlaces)
      .catch(() => setFailed(true));
  }, []);

  function stopProposing() {
    setProposing(false);
    setPickedLocation(null);
    // Markers stay clickable while proposing, but their details wait until the end.
    setSelectedId(null);
  }

  // Picking a location needs the web map; the native list cannot place points.
  const canPropose = Boolean(userId) && Platform.OS === "web";

  return (
    <View style={styles.root}>
      <Screen
        title={t("map.title")}
        subtitle={t(proposing ? "propose.mapHint" : "map.subtitle")}
      >
        {failed && (
          <ThemedText themeColor="textSecondary">
            {t("common.loadError")}
          </ThemedText>
        )}
        <PlacesMap
          places={places}
          onSelect={setSelectedId}
          onPickLocation={proposing ? setPickedLocation : undefined}
          pickedLocation={pickedLocation}
        />
        {proposing && userId ? (
          <ProposePlace
            userId={userId}
            location={pickedLocation}
            onClose={stopProposing}
          />
        ) : (
          <>
            {canPropose && !selectedId && (
              <Button
                secondary
                label={t("propose.open")}
                onPress={() => {
                  setSelectedId(null);
                  setProposing(true);
                }}
              />
            )}
          </>
        )}
      </Screen>
      {selectedId && !proposing && (
        <PlaceDetails
          key={selectedId}
          placeId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
