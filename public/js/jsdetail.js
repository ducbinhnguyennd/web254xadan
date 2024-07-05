const pricestrongInitialValue = document.querySelector('.giamay').textContent.trim();

document.querySelectorAll('.inputloai').forEach(item => {
    item.addEventListener('click', function() {
        // Loại bỏ chọn các checkbox khác
        document.querySelectorAll('.inputloai').forEach(otherCheckbox => {
            if (otherCheckbox !== this) {
                otherCheckbox.checked = false;
            }
        });

        const price = parseFloat(this.getAttribute('data-price'));
        const index = this.getAttribute('data-index');
        const pricestrong = document.querySelector('.giamay');
        const priceElement = document.querySelector(`#price${index}`);
        const priceValue = priceElement.textContent.trim();

        if (this.checked) {
            pricestrong.textContent = priceValue;
        } else {
            // Khôi phục giá trị ban đầu của pricestrong
            pricestrong.textContent = pricestrongInitialValue;
        }
    });
});

function makeCall() {
    event.preventDefault();
    // Thay đổi số điện thoại dưới đây bằng số điện thoại thực tế
    var phoneNumber = "0833354354";

    // Kiểm tra xem trình duyệt có hỗ trợ gọi điện không
    if ("contacts" in navigator && "ContactsManager" in window) {
        // Sử dụng API Contacts để gọi điện
        navigator.contacts.select(["phone"]).then(contacts => {
            // Gọi điện đến số điện thoại đã được chỉ định
            contacts.forEach(contact => {
                contact.phoneNumbers.forEach(phone => {
                    if (phone.value === phoneNumber) {
                        contact.pick();
                    }
                });
            });
        });
    } else {
        // Mở giao diện gọi điện của trình duyệt
        window.location.href = "tel:" + phoneNumber;
    }
}
document.addEventListener("DOMContentLoaded", function() {
    var content = document.getElementById("content");
    var paragraph = content.querySelector("p");
    var toggleButton = content.querySelector("#toggleButton");


    paragraph.classList.add("collapsed");

    toggleButton.addEventListener("click", function(e) {
        e.preventDefault();

        if (paragraph.classList.contains("collapsed")) {
            paragraph.classList.remove("collapsed");
            toggleButton.textContent = "Thu gọn"; // Chuyển nút sang "Thu gọn"
        } else {
            paragraph.classList.add("collapsed");
            toggleButton.textContent = "Xem thêm"; // Chuyển nút sang "Xem thêm"
        }
    });
});