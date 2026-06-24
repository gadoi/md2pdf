# Walkthrough - Markdown2PDF Kit (Tối ưu Trình chiếu & Định dạng Tài liệu A4 chuẩn Word)

Chúng tôi đã hoàn thành các cập nhật tối ưu hóa toàn diện cho cả giao diện trình chiếu và tài liệu/sales kit của hệ thống Markdown2PDF Kit. Các cải tiến mới nhất đảm bảo độ khớp 100% giữa giao diện xem trước trực quan và bản in PDF thực tế.

---

## Chi tiết các tính năng mới đã triển khai

### 1. Thanh công cụ Editor nâng cấp (Office-like Formatting Toolbar)
*   **Vị trí**: Đã thêm các nút căn lề, chọn cỡ chữ và màu sắc trực quan tại thanh công cụ phía trên khung soạn thảo Markdown.
*   **Chức năng**:
    *   **Nút căn lề (Căn trái, Căn giữa, Căn phải, Căn đều)**: Tự động chèn các cặp thẻ HTML `<div align="left|center|right|justify">...</div>` bao quanh phần văn bản đang chọn.
    *   **Nút chọn màu chữ**: Tích hợp picker màu sắc trực quan để chèn thẻ `<span style="color: #hex">...</span>`, cho phép định dạng màu sắc linh hoạt.
    *   **Lựa chọn cỡ chữ (Dropdown Select)**: Cho phép chèn thẻ `<span style="font-size: 0.85em|1.2em|1.5em|2em|2.5em">...</span>` để người dùng dễ dàng tùy chỉnh cỡ chữ cho các đoạn văn bản hay đề mục riêng biệt.
    *   **Chèn dòng Mục lục thủ công**: Nút chèn nhanh mẫu thẻ HTML liên kết mục lục `<a href="#anchor-id" class="toc-link"><span class="toc-title">Tiêu đề</span><span class="toc-dots"></span><span class="toc-page">Trang số</span></a>` để người dùng tự do thiết lập danh sách mục lục (TOC) thủ công theo phong cách chuyên nghiệp riêng.
    *   **Cơ chế Render**: Các thẻ HTML định dạng này được hỗ trợ render mượt mà trong chế độ Slide và Tài liệu nhờ vào các class tùy biến chuyên biệt trong `styles.css`.

### 2. Xem trước khớp 100% với file PDF in ra (WYSWIG PDF Mirroring)
*   **Vấn đề**: Trước đây, giao diện xem trước của tài liệu co giãn theo chiều rộng màn hình (lên đến `900px`), khiến các dòng chữ bị xô lệch, ngắt dòng không đúng vị trí khi in ra khổ giấy A4 (`210mm` / `793px`).
*   **Giải pháp**:
    *   Cấu hình kích thước của `.doc-cover-page` và `.doc-section-page` trong cột xem trước ở màn hình hiển thị cố định đúng **`width: 210mm`** và **`height: 297mm`** (tỷ lệ chuẩn A4).
    *   Đồng bộ hóa 100% phần đệm lề (Padding) giữa bản xem trước trực quan và bản in PDF: **`35mm 30mm`** cho trang bìa và **`30mm 30mm 40mm 30mm`** cho các trang tài liệu.
    *   Nhờ đó, văn bản xuống dòng, ngắt dòng hoặc phân chia trang bìa/nội dung trên màn hình xem trước sẽ **khớp chính xác tuyệt đối 100%** khi xuất ra file PDF.

### 3. Căn chỉnh trang bìa & Định dạng Mục lục (TOC) tinh tế
*   **Căn giữa trang bìa**: Sửa lỗi thông tin metadata trang bìa (`.doc-cover-meta`) không nằm chính giữa chiều ngang bằng cách thêm thuộc tính căn chỉnh tuyệt đối rộng toàn trang (`left: 0; right: 0; margin: 0 auto;`).
*   **Tinh giản Mục lục**: Loại bỏ chữ "Trang" thừa tại danh sách Mục lục ở trang số 2 của Sales Kit. Bây giờ danh sách mục lục chỉ hiển thị số trang gọn gàng ở cột bên phải (ví dụ: `3`, `4`) theo phong cách chuyên nghiệp.
*   **Thừa hưởng Font size**: Sửa lỗi in ấn không nhận cỡ chữ điều chỉnh từ thanh trượt bằng cách thay thế thuộc tính font-size tĩnh `11pt !important` thành `inherit !important` trong tệp in `@media print`.

---

## Hướng dẫn in ấn PDF & Trình chiếu Hoàn hảo

1.  **Khởi động**: Bật ứng dụng bằng file `run.bat` (Windows) hoặc `./run.sh` (Linux). Truy cập `http://localhost:3000/`.
2.  **Thiết lập**: Bật tùy chọn **"Ghép các file .md"** và **"Tự động tạo Mục lục"**.
3.  **Tùy chỉnh & Định dạng**:
    *   Chọn văn bản cần căn chỉnh hoặc tô màu và nhấn nút tương ứng trên thanh công cụ soạn thảo.
    *   Kéo thanh trượt cỡ chữ trong sidebar để điều chỉnh tỷ lệ hiển thị phù hợp.
4.  **Xuất PDF chuẩn**: Nhấp **"Xuất bản PDF đẹp"** (hoặc `Ctrl + P`).
    *   *Margins*: Chọn **None** (Không lề).
    *   *Background graphics*: Tích chọn **Có** (bắt buộc để in màu nền tràn viền).
    *   *Headers and footers*: Tích chọn **Không** (bắt buộc để ẩn thông tin trình duyệt mặc định).
