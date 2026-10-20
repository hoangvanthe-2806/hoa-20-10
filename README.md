# Một bó hoa dành tặng bạn · 20/10

Trang tặng hoa, bó hoa và thiệp chúc mừng ngày Phụ nữ Việt Nam 20/10, dùng HTML, CSS và JavaScript thuần. Hoạt động offline, không cần cài thư viện hoặc build.

## Chạy

Mở `index.html` (vườn hoa, trang chính) trực tiếp trong trình duyệt, hoặc chạy từ thư mục này:

```bash
python3 -m http.server 8080
```

Truy cập http://localhost:8080.

## Trang vườn hoa mới

Trang chính là `index.html`. Sau khi đọc thiệp (hoặc bấm **Hóa thành bó hoa**), vườn hoa tan thành ánh sáng, gom thành bó hoa rồi hai nhân vật SVG (`gift.js`) tặng hoa cho nhau và hiện lá thư để bạn nữ chạm mở. Trang phụ `bouquet.html` (bó hoa và thiệp) vẫn mở được trực tiếp, không còn nút dẫn tới. Trang hoạt động offline; khi sao chép sang nơi khác, chép kèm `garden-botany.js`, `garden-card.js` và thư mục `assets`.

- Ban đầu chỉ có một bông hoa giữa màn hình. Bấm vào hoa (hoặc dùng Tab rồi Enter/Space) để cả vườn hoa dần nở từ giữa ra hai bên.
- Sau khoảng 7 giây, thiệp chúc 20/10 tự hiện. Chọn **Ngắm vườn hoa**, nút × hoặc Escape để đóng thiệp.
- Chọn **Đọc lại thiệp** để mở lại, hoặc **Cho hoa nở lại** để trở về bông hoa đầu tiên.
- Chọn **Viết lời chúc riêng** trong thiệp để sửa người nhận, tiêu đề, lời chúc và chữ ký. **Lưu lời chúc** cập nhật thiệp và lưu trên trình duyệt hiện tại; **Hủy** bỏ sửa đổi chưa lưu. Lời chúc của vườn hoa được lưu riêng với thiệp ở `index.html`.
- Trang tự điều chỉnh theo màn hình và bỏ qua hoạt ảnh nở khi người xem bật chế độ giảm chuyển động.
- Hoa hồng dùng cùng cách dựng cánh với `index.html`: nhiều vòng cánh cong, tâm xoắn, bóng giữa các cánh, viền bắt sáng và giọt sương. Các hàm vẽ được lấy từ `script.js` sang `garden-botany.js` cho vườn hoa. Lá có gân, thân lay theo gió, hoa nghiêng nhẹ khi rê chuột gần và có cánh hoa bay; chuyển động tạm dừng khi tab bị ẩn.
- Hoa hồng, kem được xen với hoa xanh lá nhạt, xanh dương và trắng. Nền trời xanh có mây mỏng trôi chậm; gió làm thân, lá và đầu hoa lắc lư cùng nhau.
- Có thêm 20 nụ hoa nhiều màu xen qua các lớp của khu vườn, cánh còn khép và đài xanh ôm quanh gốc nụ. Nụ xuất hiện cùng đợt hoa và giữ dáng khép khi vườn đã nở.
- Trang dùng Noto Serif (chữ đứng và nghiêng) cho tiêu đề, lời gửi và chữ ký; Noto Sans cho nội dung. Font có đầy đủ dấu tiếng Việt, được lưu tại `assets/fonts` kèm giấy phép để dùng offline. Khi sao chép trang sang nơi khác, chép kèm thư mục này.

## Trải nghiệm

- Bó hoa nở trước, sau đó xuất hiện phong bì để người xem tự mở thiệp.
- Chạm từng bông hoa để nhận một lời chúc nhỏ. Khi dùng bàn phím, Tab đến bó hoa rồi nhấn Enter, Space hoặc các phím mũi tên.
- Chọn **Mở thiệp** để đọc lời chúc; đóng bằng nút ×, phím Escape hoặc **Gấp thiệp** trên phong bì.
- Hoa và tiêu đề được căn giữa khi vào trang. Khi mở thiệp, cả cụm hoa và thiệp được cân giữa; trang tự chia cột trên màn hình rộng và xếp thiệp xuống dưới trên màn hình hẹp. Thiệp nằm trong luồng trang, nên tiêu đề, ảnh, hoa và lời chúc không bị che; có thể tiếp tục tương tác với hoa khi thiệp mở.
- Chọn **Viết lời chúc riêng** để sửa người nhận, nội dung và chữ ký. **Lưu lời chúc** cập nhật thiệp và lưu trên trình duyệt hiện tại; **Hủy** bỏ các sửa đổi chưa lưu. Nội dung không tự gửi sang thiết bị hay trình duyệt khác.
- Chọn **Cho hoa nở lại** để xem lại hiệu ứng.
- Thiệp dài tự tăng chiều cao và cuộn cùng trang. Trang tôn trọng thiết lập giảm chuyển động và tạm dừng hoạt ảnh khi tab bị ẩn.

## Nhạc nền

`music.js` tự phát nhạc ở cả hai trang ngay khi người xem chạm vào màn hình lần đầu (trình duyệt không cho phát âm thanh trước đó). Nút ♪ ở góc dưới bên trái để tắt/bật.

- Muốn dùng bài của bạn: chép file vào `assets/music.mp3`. Không có file này, trang tự phát một giai điệu hộp nhạc đơn giản.

## Các tệp

- `index.html`: trang chính, vườn hoa nở và thiệp (cùng `garden-botany.js`, `garden-card.js`).
- `gift.js`: cảnh nhân vật chạy tặng bó hoa; ảnh bó hoa ở `assets/bouquet.webp`.
- `bouquet.html`: trang phụ, bó hoa, phong bì và thiệp.
- `music.js`: nhạc nền và nút bật/tắt.
- `style.css`: nền hồng, phong bì, giấy gấp, bố cục responsive và chuyển động.
- `script.js`: vẽ bó hoa, hiệu ứng nở hoa, parallax, cánh hoa bay và tương tác từng bông.
- `card.js`: mở/đóng thiệp, chuyển bố cục, lời chúc và lưu nội dung cá nhân hóa.

Đổi lời thiệp của vườn hoa trong khối `#cardMessage` của `index.html`; thiệp ở bó hoa tại `defaultGreeting` trong `card.js`; đổi các lời chúc theo bông hoa tại `WHISPER_NOTES` trong `script.js`. Nội dung được render dưới dạng văn bản thuần.

# flowers-20-10
