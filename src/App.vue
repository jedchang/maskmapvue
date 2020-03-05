<template>
  <div id="app">
    <Loading :active.sync="isLoading"></Loading>
    <div class="pageWrap">
      <div class="sidebar" :class="{ active:isCollapse }">
      <a href="#" class="collapseBtn" @click="sideBarCollapse()">
        <em v-if="!isCollapse"><i class="fa fa-angle-left fa-2" aria-hidden="true"></i></em>
        <em v-else><i class="fa fa-angle-right fa-2" aria-hidden="true"></i></em>
      </a>
      <div class="infoWrap">
        <div class="today">
          <h2 class="today-week">{{today.getDay() | convertToChineseDay}}</h2>
          <div class="today-info">
            <div class="today-date">{{today | convertToDateString}}</div>
            <div class="today-description">身分證末碼為
              <span class="today-description-high-light">
                {{today.getDay() % 2 === 0 ? "0,2,4,6,8" : "1,3,5,7,9"}}
              </span>
              可購買
            </div>
          </div>
        </div>
        <div class="search">
          <div class="search-input-group">
            <!-- <label for="cityName">縣市</label> -->
            <select
              id="cityName"
              v-model="select.cityName"
              @change="select.areaName = ''; updateMap()"
            >
              <option value="" disabled>請選擇</option>
              <option
                v-for="city in cities"
                :key="city.CityName"
                :value="city.CityName"
              >
                {{city.CityName}}
              </option>
            </select>
          </div>
          <div class="search-input-group">
            <!-- <label for="areaName">地區</label> -->
            <select
              id="areaName"
              v-model="select.areaName"
              @change="updateMap"
            >
              <option value="" disabled>請選擇</option>
              <option
                v-for="area in cities.find((city) => city.CityName === select.cityName).AreaList"
                :key="area.AreaName"
                :value="area.AreaName"
              >
                {{area.AreaName}}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="pharmacies">
        <template v-if="filterPharmacies.length !== 0">
          <template v-for="pharmacy in filterPharmacies">
            <div
              class="pharmacy"
              :key="pharmacy.properties.id"
              @click="focus(pharmacy)"
            >
              <div class="pharmacy-title">{{pharmacy.properties.name}}</div>
              <div class="pharmacy-address">{{pharmacy.properties.address}}</div>
              <div class="pharmacy-phone">{{pharmacy.properties.phone}}</div>
              <div class="pharmacy-mask-group">
                <div
                  class="pharmacy-mask"
                  :class="getMaskAdultCountClass(pharmacy.properties.mask_adult)"
                >
                  <div class="pharmacy-mask-title">成人口罩</div>
                  <div class="pharmacy-mask-count">{{pharmacy.properties.mask_adult}}</div>
                </div>
                <div
                  class="pharmacy-mask"
                  :class="getMaskChildCountClass(pharmacy.properties.mask_child)"
                >
                  <div class="pharmacy-mask-title">兒童口罩</div>
                  <div class="pharmacy-mask-count">{{pharmacy.properties.mask_child}}</div>
                </div>
              </div>
            </div>
          </template>
        </template>
        <div
          v-else
          class="no-data"
        >
          沒有資料 或 請選擇地區
        </div>
      </div>
    </div>
    <div id="map" calss="leaflet-container leaflet-fade-anim leaflet-grab leaflet-touch-drag"
     :class="{ active:isCollapse } ">map</div>
    </div>
  </div>
</template>

<script>
import cities from './assets/cityName.json';
import OpenStreetMap, { markerIcons } from './assets/openStreetMap';

const getMaskAdultCountClass = (count) => {
  if (count > 0) {
    return 'adultMaskInStock';
  }
  if (count <= 0) {
    return 'adultMaskOutOfStock';
  }
  return '';
};
const getMaskChildCountClass = (count) => {
  if (count > 0) {
    return 'childMaskInStock';
  }
  if (count <= 0) {
    return 'childMaskOutOfStock';
  }
  return '';
};
const createPopUp = (pharmacy) => (`
  <div class="pharmacy-title">${pharmacy.properties.name}</div>
  <div class="pharmacy-address">${pharmacy.properties.address}</div>
  <div class="pharmacy-phone">${pharmacy.properties.phone}</div>
  <div class="pharmacy-mask-group">
    <div class="pharmacy-mask ${getMaskAdultCountClass(pharmacy.properties.mask_adult)} popUp">
      <div class="pharmacy-mask-title">成人口罩</div>
      <div class="pharmacy-mask-count">${pharmacy.properties.mask_adult}</div>
    </div>
    <div class="pharmacy-mask ${getMaskChildCountClass(pharmacy.properties.mask_child)} popUp">
      <div class="pharmacy-mask-title">兒童口罩</div>
      <div class="pharmacy-mask-count">${pharmacy.properties.mask_child}</div>
    </div>
  </div>
  <p id="lastUpdate">最後更新時間：${pharmacy.properties.updated}</p>
`);
export default {
  name: 'App',
  data: () => ({
    cities,
    pharmacies: [],
    select: {
      cityName: '臺南市',
      areaName: '歸仁區',
    },
    today: new Date(),
    isLoading: false,
    isCollapse: false,
  }),
  async mounted() {
    this.isLoading = true;
    this.openStreetMap = new OpenStreetMap('map', 23.1508776, 120.2019337);
    const response = await this.axios.get('https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json');
    this.pharmacies = response.data.features;
    this.updateMap();
    this.isLoading = false;
  },
  methods: {
    getMaskAdultCountClass,
    getMaskChildCountClass,
    setMarkers() {
      this.filterPharmacies.forEach((pharmacy) => {
        this.addMarker(pharmacy);
      });
    },
    addMarker(pharmacy, isOpenPopUp = false) {
      const [lng, lat] = pharmacy.geometry.coordinates;
      const { mask_adult: maskAdultCount, mask_child: maskChildCount } = pharmacy.properties;
      const icon = maskAdultCount || maskChildCount ? markerIcons.blue : markerIcons.grey;
      this.openStreetMap.addMarker(lat, lng, icon, createPopUp(pharmacy), isOpenPopUp);
    },
    resetMarkers() {
      this.openStreetMap.removeAllMarkers();
    },
    moveTo(pharmacy) {
      const [lng, lat] = pharmacy.geometry.coordinates;
      this.openStreetMap.moveTo(lat, lng);
    },
    openPopUp(pharmacy) {
      this.addMarker(pharmacy, true);
    },
    updateMap() {
      this.resetMarkers();
      this.setMarkers();
      if (this.filterPharmacies.length !== 0) {
        this.focus(this.filterPharmacies[0]);
      }
    },
    focus(pharmacy) {
      this.moveTo(pharmacy);
      this.openPopUp(pharmacy);
    },
    sideBarCollapse() {
      console.log('clicked');
      console.log(this.isCollapse);
      if (this.isCollapse === false) {
        this.isCollapse = true;
      } else if (this.isCollapse === true) {
        this.isCollapse = false;
      }
    },
  },
  computed: {
    filterPharmacies() {
      const { cityName, areaName } = this.select;
      return this.pharmacies.filter((pharmacy) => (
        pharmacy.properties.county === cityName && pharmacy.properties.town === areaName
      ));
    },
  },
  filters: {
    convertToChineseDay(day) {
      const chineseDay = ['日', '一', '二', '三', '四', '五', '六'];
      return `星期${chineseDay[day]}`;
    },
    convertToDateString(date) {
      const pad = (n) => (n < 10 ? `0${n}` : n);
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    },
  },
};
</script>

<style lang="scss">
@import "./assets/reset.scss";
@import "./assets/style.scss";

</style>
