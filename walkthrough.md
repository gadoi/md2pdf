# Walkthrough - Markdown2PDF Kit (Tối ưu hóa Căn lề PDF & Đồng bộ Màu sắc Tràn viền)

Chúng tôi đã khắc phục triệt để các lỗi liên quan đến in ấn PDF, bao gồm lỗi chữ không căn giữa trang ở trang 1/trang bìa khi ghép các file `.md` tự động, và đồng bộ hóa màu sắc nền tràn viền (full-bleed background) khớp 100% giữa bản xem trước trực quan và bản in PDF thực tế.

---

## Chi tiết các cải tiến đã thực hiện

### 1. Sửa lỗi căn giữa chữ Slide & Trang bìa khi in PDF
*   **Vấn đề**: Khi xuất PDF, chữ ở các slide tiêu đề (trang 1) hoặc trang bìa tài liệu bị lệch (không nằm giữa trang). Điều này xảy ra do container cha của các trang in (`.slides-container` và `.document-mode`) vẫn mang thuộc tính `display: flex` từ CSS màn hình, gây nhiễu cho cơ chế ngắt trang và phân bổ kích thước của Chrome.
*   **Giải pháp**: 
    *   Cập nhật `@media print` trong `styles.css` để buộc các container cha (`.slides-container` và `.document-mode`) thành `display: block !important`.
    *   Thiết lập kích thước tuyệt đối chuẩn A4 cho các slide (`297mm x 210mm` cho Slide landscape) và các trang tài liệu (`210mm x 297mm` cho Tài liệu portrait) khi in.
    *   Bản thân mỗi trang in (`.slide`, `.doc-cover-page`) sử dụng `display: flex !important; flex-direction: column !important; justify-content: center !important;` giúp cơ chế căn giữa dọc hoạt động chuẩn xác 100% trên trang giấy thực tế.

### 2. Đồng bộ màu nền tràn viền (Full-Bleed Background) khớp 100% preview
*   **Vấn đề**: Các theme có màu nền slide chứa độ trong suốt (rgba) hiển thị trên nền preview tối/sáng của app. Khi in trên nền giấy trắng của trình duyệt, các slide bị nhạt màu đi hoặc xám xịt, không giữ được vẻ cao cấp nguyên bản.
*   **Giải pháp**:
    *   Đặt màu nền của thẻ `html`, `body` và `#print-viewport` khi in trùng khớp hoàn toàn với màu nền preview của từng theme (`background: var(--preview-bg) !important`).
    *   Đặt màu nền của các slide và trang tài liệu khi in là `var(--slide-card-bg) !important` để giữ nguyên độ trong suốt mịn màng đè lên màu nền preview.
    *   Nhờ cơ chế kế thừa biến CSS thông minh, bản in PDF tự động đồng bộ màu sắc 100% với giao diện đã chọn trên màn hình mà không cần hardcode màu sắc của từng theme trong `@media print`, giúp việc bảo trì code cực kỳ dễ dàng.

### 3. Cải tiến thuật toán chia trang chế độ tài liệu khi ghép file
*   **Vấn đề**: Khi ghép các file `.md` ở chế độ tài liệu, thuật toán cũ chỉ phân trang theo thẻ `H2`. Vì mỗi file `.md` ghép phía sau đều bắt đầu bằng tiêu đề chính `H1` (ví dụ `# 02 — Sales Pitch`), các tiêu đề này bị dính liền vào trang trước, tạo nên bố cục lộn xộn.
*   **Giải pháp**:
    *   Cập nhật thuật toán trong `app.js` để ngắt trang khi gặp thẻ `H1` (tiêu đề file mới) hoặc thẻ ngắt trang `HR` (`---`).
    *   Các trang bắt đầu bằng thẻ `H1` (chương mới) được gán class `.doc-section-page.chapter-page` và được căn giữa dọc/ngang tiêu đề cực kỳ trang trọng.
    *   Mục lục tài liệu (TOC) được nâng cấp để hiển thị phân cấp tiêu đề `H1` và `H2` một cách thông minh.

### 4. Tối ưu hóa padding và chân slide khi in
*   Giảm padding dọc của slide khi in từ `35mm` xuống `25mm` để tăng diện tích hiển thị nội dung slide, tránh bị tràn chữ xuống dòng.
*   Cố định vị trí của logo và số trang chân slide bằng tọa độ tuyệt đối `mm` (`bottom: 12mm; left: 16mm` / `right: 16mm`) để đảm bảo tính cân đối ổn định trên giấy in A4.

---

## Hướng dẫn sử dụng & in ấn hoàn hảo

1.  **Khởi chạy**: Khởi động app qua file `run.bat` (Windows) hoặc `./run.sh` (Linux). Truy cập `http://localhost:3000/`.
2.  **Thiết lập**: Bật tùy chọn **"Ghép các file .md"** và **"Tự động tạo Mục lục"** ở cột trái.
3.  **In ấn**: Chọn định dạng (Slide hoặc Tài liệu), chọn theme yêu thích, sau đó nhấn **"Xuất bản PDF đẹp"** (hoặc `Ctrl + P`).
4.  **Cài đặt hộp thoại in của trình duyệt**:
    *   **Margins**: Chọn **None** (Không lề).
    *   **Background graphics**: Tích chọn **Có** (để in màu nền tràn viền).
    *   **Headers and footers**: Tích chọn **Không** (để loại bỏ thông tin ngày tháng, đường dẫn web mặc định của Chrome).
5.  **Biên tập PDF**: Sử dụng nút **"Chỉnh sửa & Ký tên PDF"** nếu muốn đóng dấu watermark hoặc ký vẽ chữ ký điện tử lên tài liệu đã xuất.
