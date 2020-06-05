<template>
  <div>
    <el-amap
      vid="amapDemo"
      :dragEnable="false"
      :center="center"
      :zoom="zoom"
      :events="events"
      class="amap-demo"
      :plugin="plugins"
    >
      <el-amap-polyline
        :editable="polyline.editable"
        :path="polyline.path"
        :events="polyline.events"
      ></el-amap-polyline>
      <!-- <el-amap-ground-image
        v-for="(groundimage,index) in spotList"
        :url="groundimage.url"
        :bounds="groundimage.bounds"
        :events="groundimage.events"
        :key="index"
      ></el-amap-ground-image>-->
      <el-amap-marker
        v-for="(marker, index) in spotList"
        :position="marker.position"
        :events="marker.events"
        :visible="marker.visible"
        :draggable="marker.draggable"
        :template="marker.template"
        :vid="index"
        :key="index"
      ></el-amap-marker>
    </el-amap>
    <el-row>
      <el-col :span="2">
        <el-button
          size="mini"
          class="filter-item"
          @click="mapButtonClick"
          type="primary"
          icon="edit"
        >{{mapButtonText}}</el-button>
      </el-col>
      <el-col :span="2">
        <el-button
          size="mini"
          class="filter-item"
          @click="changeEditable"
          type="primary"
          icon="edit"
        >编辑线路</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import VueAMap from "vue-amap";
// import { amapManager } from "vue-amap";
let amapManager = new VueAMap.AMapManager();
let _this;
export default {
  name: "dylMap",
  data() {
    return {
      plugins: ["MapType", "ToolBar", "OverView"],
      mapButtonText: "开始",
      working: false,
      mousedown: false,
      zoom: 12,
      center: [121.59996, 31.197646],
      events: {
        init(o) {
          let marker = new AMap.Marker({
            position: _this.center
          });
          marker.setMap(o);
        },
        click(mapsEvent) {
          //   console.log(mapsEvent);
        },
        mousedown() {
          _this.mousedown = true;
        },
        mouseup() {
          _this.mousedown = false;
          console.log("up");
        },
        mousemove(mapsEvent, a, b, c, d) {
          console.log("move");
          if (!_this.working) {
            return;
          }
          if (!_this.mousedown) {
            return;
          }
          // lat=P   lng=O
          _this.polyline.path.push([mapsEvent.lnglat.O, mapsEvent.lnglat.P]);
          return;
        }
      },
      spotList: [],
      polyline: {
        path: [],
        events: {
          click(e) {
            // alert("click polyline");
          },
          mouseup() {
            _this.mousedown = false;
          },
          end: e => {
            let newPath = e.target
              .getPath()
              .map(point => [point.lng, point.lat]);
            console.log(newPath);
          }
        },
        editable: false
      }
    };
  },
  mounted() {},
  created() {
    _this = this;
    this.createMap();
    this.initMap();
    this.getSpot();
  },
  methods: {
    createMap() {
      Vue.use(VueAMap);
      VueAMap.initAMapApiLoader({
        key: "108f52bdd9683ea0c15236eec7fceeeb",
        plugin: [
          "AMap.Scale",
          "AMap.OverView",
          "AMap.ToolBar",
          "AMap.MapType",
          "AMap.PolyEditor"
        ],
        v: "1.4.4"
      });
    },
    getSpot() {
      this.spotList.push({
        position: [121.09996, 31.197646],
        events: {
          click: () => {
            alert("click marker");
          },
          dragend: e => {
            console.log("---event---: dragend");
            this.spotList[0].position = [e.lnglat.lng, e.lnglat.lat];
          }
        },
        visible: true,
        draggable: true,
        // content:"<span>1</span>",
        template: "<span>1</span>"
      });
    },
    initMap() {
      //   this.events.init();
      this.refreshData();
    },
    refreshData() {
      this.mapButtonText = "开始";
      this.working = false;
      this.mousedown = false;
      this.zoom = 12;
      this.center = [121.59996, 31.197646];
      this.polyline.path = [];
      this.polyline.editable = false;
    },
    changeEditable() {
      this.polyline.editable = !this.polyline.editable;
      // this.polyline.path = JSON.parse(JSON.stringify(this.linePath));
    },
    mapButtonClick() {
      if (this.mapButtonText == "开始") {
        this.mapButtonText = "暂停";
        this.working = true;
      } else {
        this.mapButtonText = "开始";
        this.working = false;
      }
    }
  }
};
</script>

<style scoped>
.amap-demo {
  height: 600px;
}
</style>