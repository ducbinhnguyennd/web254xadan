const { SitemapStream, streamToPromise } = require('sitemap');
const { createReadStream, mkdtempSync, writeFileSync, readFileSync } = require('fs');
const { join } = require('path');

const paths = ['/', '/thanhtoan', '/shop', '/contact'];

exports.sitemap = async(req, res, next) => {
    try {
        // Tạo thư mục tạm thời
        const tempDir = mkdtempSync('/tmp/');

        const smStream = new SitemapStream({ hostname: 'https://www.9mobile.shop' });

        // Thêm các đường dẫn vào sitemap
        paths.forEach(path => {
            smStream.write({ url: path, changefreq: 'daily', priority: 0.7 });
        });

        // Kết thúc quá trình tạo sitemap
        smStream.end();

        // Chuyển nội dung của sitemap thành một biến buffer
        const sitemapBuffer = await streamToPromise(smStream);

        // Ghi nội dung của sitemap vào thư mục tạm thời
        const tempFilePath = join(tempDir, 'sitemap.xml');
        writeFileSync(tempFilePath, sitemapBuffer);

        // Đọc và trả về nội dung của tệp sitemap.xml cho client
        const readStream = createReadStream(tempFilePath);
        readStream.pipe(res);

    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
};