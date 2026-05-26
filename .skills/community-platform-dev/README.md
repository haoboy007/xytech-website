# Taro 小程序页面（自动转换）

由 h5-to-taro-converter.py 自动生成

## 页面清单

| 页面 | 路径 |
|------|------|
| AIAssistant | pages/aiassistant/index |
| About | pages/about/index |
| Admin | pages/admin/index |
| BusinessDetail | pages/businessdetail/index |
| Business | pages/business/index |
| Celebrity | pages/celebrity/index |
| ChatList | pages/chatlist/index |
| Chat | pages/chat/index |
| Circle | pages/circle/index |
| CreatePost | pages/createpost/index |
| EventDetail | pages/eventdetail/index |
| Events | pages/events/index |
| Follows | pages/follows/index |
| FundingDetail | pages/fundingdetail/index |
| Home | pages/home/index |
| InvestmentDetail | pages/investmentdetail/index |
| Login | pages/login/index |
| MnaDetail | pages/mnadetail/index |
| NotFound | pages/notfound/index |
| Notifications | pages/notifications/index |
| OpportunityDetail | pages/opportunitydetail/index |
| OrderDetail | pages/orderdetail/index |
| PointsCenter | pages/pointscenter/index |
| PointsHistory | pages/pointshistory/index |
| PointsLeaderboard | pages/pointsleaderboard/index |
| PointsMall | pages/pointsmall/index |
| PointsOrders | pages/pointsorders/index |
| PointsSignin | pages/pointssignin/index |
| PointsTasks | pages/pointstasks/index |
| PostDetail | pages/postdetail/index |
| PrivacyPolicy | pages/privacypolicy/index |
| Profile | pages/profile/index |
| PublicProfile | pages/publicprofile/index |
| Sample | pages/sample/index |
| UserAgreement | pages/useragreement/index |
| Verification | pages/verification/index |
| WebView | pages/webview/index |

## 手动适配项

转换脚本已完成以下工作：
- ✅ 路由替换 (React Router → Taro)
- ✅ HTML标签替换 (div/span → view/text)
- ✅ Tailwind类名简化为SCSS工具类
- ✅ 添加Taro必要导入

仍需手动完成：
- [ ] 替换 shadcn/ui 组件为 Taro 自研组件
- [ ] 图片上传改为 Taro.chooseImage
- [ ] 地图组件改为腾讯地图或小程序原生 map
- [ ] 分享功能接入 onShareAppMessage
- [ ] 通知推送改为微信小程序订阅消息
- [ ] 适配底部导航为 tabBar
- [ ] 测试各页面在微信开发者工具中的表现
