/*jshint esversion: 6 */

exports.artesanato = function(data){
  let promise = new Promise((resolve, reject)=>{
    if(data && data[0] && data[0].firstExample){
      for (let i = 0; i < data.length; i++) {
        let jsonld = {
          "@context": "http://schema.org",
          "@type": "VisualArtwork",
          "name": `${data[i].firstExample['item type'].name} with the ${data[i].firstExample.theme.name} design`,
          "image": `${data[i].image[0]}`,
          "description": `${data[i].firstExample.description}`,
          "creator": [{
            "@type": "Person",
            "name": data[i].firstExample.producer.name
          }],
        };
        data[i].jsonld = jsonld;
        if(i === data.length-1){
          resolve(data);
        }
      }
    }
    else{
      resolve(null);
    }
  });
  return promise;
}

exports.entity = function(data){
  function formatOpeningTimes(times){
      let days = Object.keys(times);
      let sorted = [[]]
      let time = []
      for (var i = 0; i < days.length; i++) {
        if(i === 0){
          sorted[0].push(days[i].slice(0, 2));
          time.push(times[days[i]]);
        }
        if(i > 0 && times[days[i]].toString() === times[days[i-1]].toString()){
          sorted[sorted.length-1].push(days[i].slice(0, 2));
        }
        else{
          sorted.push([days[i].slice(0, 2)])
          time.push(times[days[i]]);
        }
        if(i === days.length-1){
          let firstD = sorted.shift();
          let firstT = time.shift();
          return assembleString(sorted, time);
        }
      }

      function assembleString(sorted, time){
        let final = ""
        for (var i = 0; i < sorted.length; i++) {
          if(sorted[i].length > 1){
            let start = sorted[i].shift(),
                end = sorted[i].pop();
                final += (start +'-'+end);
                final += (' ' + time[i].toString().replace(',', '-'));
          }
          else{
            final += ' ' + sorted[i].shift() + ' ' + time[i].toString().replace(',', '-');
          }
          if(i === sorted.length -1){
            return final;
          }
        }
      }
  }

  let jsonld = {
    "@context": "http://schema.org",
    "@type": `${data.storeCategory}`,
    "priceRange": `${data.priceRange}`,
    "currenciesAccepted": `${data.currency}`,
    "openingHours": `${formatOpeningTimes(data.openingHours)}`,
    "paymentAccepted": "Credit Card",
    "telephone": `${'+' + data['country code'] + data.phone}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": `${data.PostalAddress.streetAddress}`,
      "addressLocality": `${data.PostalAddress.addressLocality}`,
      "addressRegion": `${data.PostalAddress.addressRegion}`,
      "postalCode": `${data.PostalAddress.postalCode}`,
      "addressCountry": `${data.PostalAddress.addressCountry}`,
    },
    "email": `${data.email}`,
    "logo": "/images/logos/android-chrome-192x192.png",
    "taxID": `${data['fiscal number']}`,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": `${data.location.lat}`,
      "longitude": `${data.location.lng}`,
    },
    "name": `${data.name}`,
    "photo": "./images/entity/marquee.webp",
  };

  return jsonld;

}

//CURRENTLY SPECIFIC TO THE HOLIDAY ROUTE
exports.holiday = function(data){
  let item = data[0];
  //data is nested
  let promise = new Promise((resolve, reject)=>{
    let j = {};

    if(item.path && item.files){
      let imgpath = item.path;
      let imgArray = item.files.filter((value, index, array)=>{if(value !== 'old'){ return value}});
      let imgsrc = 'https://swiftmo.com'+encodeURIComponent(imgpath)+'/'+encodeURIComponent(imgArray[0]);
      j.image = imgsrc;
    }

    switch(item['@type']){
      case 'TouristTrip':
        j['@context'] = "http://schema.org";
        j['@type'] = item['@type'];
        j.name = item.name;
        j.description = item.description;
        j.arrivalTime = item['due on dates'][0].humanDate + '12:00:00';
        j.departureTime = item['due on dates'][item['due on dates'].length-1].humanDate + '12:00:00';
        j.availabilityEnds = item.expires;
        j.provider = item.provider;

        j.mainEntityOfPage ={
          "@type": "WebPage",
          "@id": "https:swiftmo.com/holidays/?name=" + encodeURIComponent(item.name)
        };

        j.touristType = {
          "@type": "audience",
          "audienceType": item['tourist type'],
          "geographicArea": [{
            "@type": "AdministrativeArea",
            "name": item.area
          }]
        };

        j.itinerary = {
            "@context": "http://schema.org",
            "@type": "ItemList",
            "numberOfItems": item.itinerary.length,
            "itemListElement": []
          };

        item.itinerary.forEach((e, i)=>{
          j.itinerary.itemListElement.push(
            {
              "@type": "ListItem",
              "position": i+1,
              "item": {
                "@type": e.place && e.place['@type'] ? e.place['@type'] : undefined,
                "name": e.place && e.place.name ? e.place.name : undefined,
                "description": e.place && e.place.description ? e.place.description : undefined,
              }
          });
        });
        /*
        j.review = [];
        item.reviews.forEach((e, i)=>{
          j.review.push(
            {
              "@type": "Review",
              "author": e.author ? e.author : undefined,
              "reviewRating": {
                "@type": "Rating",
                "bestRating": 5,
                "ratingValue": e.ratingValue,
                "worstRating": 1,
              }
          });
        });*/
      break;
    }

    data.jsonld = j;
    resolve(data);
  });
  return promise;
};

exports.provider = function(data){
  let item = data[0];
  //data is nested
  let promise = new Promise((resolve, reject)=>{
    let j = {};

    if(item.path && item.files){
      let imgpath = item.path;
      let imgArray = item.files.filter((value, index, array)=>{if(value !== 'old'){ return value}});
      let imgsrc = 'https://swiftmo.com'+encodeURIComponent(imgpath)+'/'+encodeURIComponent(imgArray[0]);
      j.image = imgsrc;
    }

    switch(item['@type']){
      case 'TouristTrip':
        j['@context'] = "http://schema.org";
        j['@type'] = item['@type'];
        j.name = item.name;
        j.description = item.description;
        j.arrivalTime = item['due on dates'][0].humanDate + '12:00:00';
        j.departureTime = item['due on dates'][item['due on dates'].length-1].humanDate + '12:00:00';
        j.availabilityEnds = item.expires;
        j.provider = item.provider;

        j.mainEntityOfPage ={
          "@type": "WebPage",
          "@id": "https:swiftmo.com/holidays/?name=" + encodeURIComponent(item.name)
        };

        j.touristType = {
          "@type": "audience",
          "audienceType": item['tourist type'],
          "geographicArea": [{
            "@type": "AdministrativeArea",
            "name": item.area
          }]
        };

        j.itinerary = {
            "@context": "http://schema.org",
            "@type": "ItemList",
            "numberOfItems": item.itinerary.length,
            "itemListElement": []
          };

        item.itinerary.forEach((e, i)=>{
          j.itinerary.itemListElement.push(
            {
              "@type": "ListItem",
              "position": i+1,
              "item": {
                "@type": e.place && e.place['@type'] ? e.place['@type'] : undefined,
                "name": e.place && e.place.name ? e.place.name : undefined,
                "description": e.place && e.place.description ? e.place.description : undefined,
              }
          });
        });
        /*
        j.review = [];
        item.reviews.forEach((e, i)=>{
          j.review.push(
            {
              "@type": "Review",
              "author": e.author ? e.author : undefined,
              "reviewRating": {
                "@type": "Rating",
                "bestRating": 5,
                "ratingValue": e.ratingValue,
                "worstRating": 1,
              }
          });
        });*/
      break;
    }

    data.jsonld = j;
    resolve(data);
  });
  return promise;
};
