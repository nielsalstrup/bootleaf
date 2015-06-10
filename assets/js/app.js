var map, featureList, regionSearch = [], listingsSearch = [];

jQuery(window).resize(function() {
  sizeLayerControl();
});

jQuery(document).on("click", ".feature-row", function(e) {
  jQuery(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt(jQuery(this).attr("id"), 10));
});

jQuery(document).on("mouseover", ".feature-row", function(e) {
  highlight.clearLayers().addLayer(L.circleMarker([jQuery(this).attr("lat"), jQuery(this).attr("lng")], highlightStyle));
});

jQuery(document).on("mouseout", ".feature-row", clearHighlight);

jQuery("#about-btn").click(function() {
  jQuery("#aboutModal").modal("show");
  jQuery(".navbar-collapse.in").collapse("hide");
  return false;
});

jQuery("#full-extent-btn").click(function() {
  map.fitBounds(regions.getBounds());
  jQuery(".navbar-collapse.in").collapse("hide");
  return false;
});

jQuery("#legend-btn").click(function() {
  jQuery("#legendModal").modal("show");
  jQuery(".navbar-collapse.in").collapse("hide");
  return false;
});

jQuery("#login-btn").click(function() {
  jQuery("#loginModal").modal("show");
  jQuery(".navbar-collapse.in").collapse("hide");
  return false;
});

jQuery("#list-btn").click(function() {
  jQuery('#sidebar').toggle();
  map.invalidateSize();
  return false;
});

jQuery("#nav-btn").click(function() {
  jQuery(".navbar-collapse").collapse("toggle");
  return false;
});

jQuery("#sidebar-toggle-btn").click(function() {
  jQuery("#sidebar").toggle();
  map.invalidateSize();
  return false;
});

jQuery("#sidebar-hide-btn").click(function() {
  jQuery('#sidebar').hide();
  map.invalidateSize();
});

function sizeLayerControl() {
  jQuery(".leaflet-control-layers").css("max-height", jQuery("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    jQuery("#sidebar").hide();
    map.invalidateSize();
  }
}

function syncSidebar() {
  /* Empty sidebar features */
  jQuery("#feature-list tbody").empty();
  /* Loop through listingss layer and add only features which are in the map bounds */
  listingss.eachLayer(function (layer) {
    if (map.hasLayer(listingsLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        jQuery("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="assets/img/listings.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="icon-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });
}

/* Basemap Layers */
var baseOSM = L.tileLayer("http://a.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["1234"],
  attribution: 'Kortdata (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> bidragsydere, CC-BY-SA.'
});
var mapquestOSM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["otile1", "otile2", "otile3", "otile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
});
var mapquestOAM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
});
var mapquestHYB = L.layerGroup([L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"]
}), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
})]);

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

var regions = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "black",
      fill: false,
      opacity: 1,
      clickable: false
    };
  },
  onEachFeature: function (feature, layer) {
    regionSearch.push({
      name: layer.feature.properties.BoroName,
      source: "Kommuner",
      id: L.stamp(layer),
      bounds: layer.getBounds()
    });
  }
});
jQuery.getJSON("wp-content/themes/minpasning/inc/data/kommuner.geojson", function (data) {
  regions.addData(data);
});

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});

/* Empty layer placeholder to add to layer control for listening when to add/remove listingss to markerClusters layer */
var listingsLayer = L.geoJson(null);
var listingss = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "wp-content/themes/minpasning/images/" + feature.properties.OWNERSHIP + "-" + feature.properties.TYPE + ".png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.NAME,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.NAME + "</td></tr>" + "<tr><th>Telefon</th><td>" + feature.properties.TEL + "</td></tr>" + "<tr><th>Addresse</th><td>" + feature.properties.ADDRESS1 + '<br/>' + feature.properties.ADDRESS2 + "</td></tr>" + "<tr><th>Website</th><td><a class='url-break' href='" + feature.properties.URL + "' target='_blank'>" + feature.properties.URL + "</a></td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          jQuery("#feature-title").html(feature.properties.NAME);
          jQuery("#feature-info").html(content);
          jQuery("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      jQuery("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="wp-content/themes/minpasning/images/' + layer.feature.properties.OWNERSHIP + '-' + layer.feature.properties.TYPE + '.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="icon-chevron-right pull-right"></i></td></tr>');
      listingsSearch.push({
        name: layer.feature.properties.NAME,
        address: layer.feature.properties.ADDRESS1,
        source: "Listings",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
jQuery.getJSON("wp-content/themes/minpasning/inc/map-query.php", function (data) {
  listingss.addData(data);
  map.addLayer(listingsLayer);
});

map = L.map("map", {
  zoom: 8,
  center: [55.546002, 11.7463939],
  layers: [baseOSM, regions, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === listingsLayer) {
    markerClusters.addLayer(listingss);
    syncSidebar();
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === listingsLayer) {
    markerClusters.removeLayer(listingss);
    syncSidebar();
  }
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  jQuery.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      jQuery("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'>Udviklet af <a href='http://alstrupnext.com'>alstrupnext</a> | </span><a href='#' onclick='jQuery(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "icon-map-marker",
  metric: false,
  strings: {
    title: "Min placering",
    popup: "Du er inden for {distance} {unit} fra dette punkt",
    outsideMapBoundsMsg: "Du befinder dig vist uden for kortet"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Vejkort": mapquestOSM,
  "Luftfoto": mapquestOAM,
  "Luftfoto med veje": mapquestHYB
};

var groupedOverlays = {
  "Steder": {
    "<img src='wp-content/themes/minpasning/images/kommunal-integreret.png' width='24' height='28'>&nbsp;Institutioner": listingsLayer
  },
  "Reference": {
    "Kommuner": regions
  }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
jQuery("#searchbox").click(function () {
  jQuery(this).select();
});

/* Prevent hitting enter from refreshing the page */
jQuery("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

jQuery("#featureModal").on("hidden.bs.modal", function (e) {
  jQuery(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
jQuery(document).one("ajaxStop", function () {
  jQuery("#loading").hide();
  sizeLayerControl();
  /* Fit map to regions bounds */
  map.fitBounds(regions.getBounds());
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});

  var regionsBH = new Bloodhound({
    name: "Kommuner",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: regionSearch,
    limit: 10
  });

  var listingssBH = new Bloodhound({
    name: "Theaters",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: listingsSearch,
    limit: 10
  });

  var museumsBH = new Bloodhound({
    name: "Museums",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: museumSearch,
    limit: 10
  });

  var geonamesBH = new Bloodhound({
    name: "GeoNames",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
      filter: function (data) {
        return jQuery.map(data.geonames, function (result) {
          return {
            name: result.name + ", " + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: "GeoNames"
          };
        });
      },
      ajax: {
        beforeSend: function (jqXhr, settings) {
          settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
          jQuery("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
        },
        complete: function (jqXHR, status) {
          jQuery('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
        }
      }
    },
    limit: 10
  });
  regionsBH.initialize();
  listingssBH.initialize();
  museumsBH.initialize();
  geonamesBH.initialize();

  /* instantiate the typeahead UI */
  jQuery("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "Kommuner",
    displayKey: "name",
    source: regionsBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'>Kommuner</h4>"
    }
  }, {
    name: "Theaters",
    displayKey: "name",
    source: listingssBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/listings.png' width='24' height='28'>&nbsp;Theaters</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }, {
    name: "Museums",
    displayKey: "name",
    source: museumsBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/museum.png' width='24' height='28'>&nbsp;Museums</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }, {
    name: "GeoNames",
    displayKey: "name",
    source: geonamesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "Kommuner") {
      map.fitBounds(datum.bounds);
    }
    if (datum.source === "Theaters") {
      if (!map.hasLayer(listingsLayer)) {
        map.addLayer(listingsLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "Museums") {
      if (!map.hasLayer(museumLayer)) {
        map.addLayer(museumLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "GeoNames") {
      map.setView([datum.lat, datum.lng], 14);
    }
    if (jQuery(".navbar-collapse").height() > 50) {
      jQuery(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    jQuery(".navbar-collapse.in").css("max-height", jQuery(document).height() - jQuery(".navbar-header").height());
    jQuery(".navbar-collapse.in").css("height", jQuery(document).height() - jQuery(".navbar-header").height());
  }).on("typeahead:closed", function () {
    jQuery(".navbar-collapse.in").css("max-height", "");
    jQuery(".navbar-collapse.in").css("height", "");
  });
  jQuery(".twitter-typeahead").css("position", "static");
  jQuery(".twitter-typeahead").css("display", "block");
});

// Leaflet patch to make layer control scrollable on touch browsers
var container = jQuery(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}
