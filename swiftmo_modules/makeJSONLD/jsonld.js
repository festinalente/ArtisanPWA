/*jshint esversion: 6 */

/*  { _id:
     { weight: 628,
       type: 'Pot Stand',
       pattern: 'Rambling Rose - Pink & Green',
       dimensions: [Array] },
    firstExample:
     { _id: 5fa2981ca266110f54dc6335,
       itemref: 'd2801732',
       created: 1604491292685,
       'image links': [Array],
       itemtype: 'new stock item',
       name: 'Pot Stand',
       description:
        'This medium hot plate features a non-slip cork backing, which is perfect\n for protecting delicate surfaces from hot pots and pans while cooking \nor while serving at table. We use cork because, like clay, it is a \nversatile natural material, and like pottery it is synonymous with \nAlgarve.     ',
       'item type': [Object],
       'linked post': [Object],
       price: 1800,
       producer: [Object],
       quantity: 10,
       special: false,
       tax: 23,
       theme: [Object],
       templateItem: false },
    count: 1,
    items: [ 'd2801732' ],
    image:
     [ '/images/stock/new stock item/Pot Stand/Rambling Rose - Pink & Green/12c38112-main.jpg',
       '/images/stock/new stock item/Pot Stand/Rambling Rose - Pink & Green/12c38112-secondary.jpg' ] }
*/
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
    "@type": "HomeGoodsStore",
    "priceRange": "€€",
    "currenciesAccepted": `${data.currency}`,
    "openingHours": `${formatOpeningTimes(data.openingHours)}`,
    "paymentAccepted": "Cash, Credit Card",
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
    "logo": "https://www.porchespottery.com/images/logos/roundText80px.png",
    "taxID": `${data['fiscal number']}`,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": `${data.location.lat}`,
      "longitude": `${data.location.lng}`,
    },
    "name": `${data.name}`,
    "photo": "https://www.porchespottery.com/images/blog/About%20Porches%20Pottery/About%20Porches%20Pottery-538d.jpg",
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
