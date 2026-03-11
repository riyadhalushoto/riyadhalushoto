import { VitePWA } from "vite-plugin-pwa";

export default {
plugins: [
VitePWA({
registerType:"autoUpdate",
manifest:{
name:"Madrasa Riyadha",
short_name:"Madrasa",
theme_color:"#02140f",
icons:[
{
src:"/icon.png",
sizes:"192x192",
type:"image/png"
}
]
}
})
]
}