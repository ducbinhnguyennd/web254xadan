const express = require('express')
const router = express.Router()
const Sp = require('../models/chitietSpModel')
const LoaiSP = require('../models/tenSpModel')
const multer = require('multer')
var myMDBlog = require('../models/blog.model')
const checkAuth = require('../controllers/checkAuth')
const slugify = require('slugify')
const LinkKien = require('../models/LinkKienModel')
const LoaiLinkKien = require('../models/LoaiLinhKien')
const Notify = require('../models/NotifyModel')
const DanhGia = require('../models/DanhGiaModel')
const { linkSync } = require('fs')
const moment = require('moment')
const momenttimezone = require('moment-timezone')
const unicode = require('unidecode')

const storage = multer.memoryStorage()

const upload = multer({ storage: storage })
router.get('/mess', async (req, res) => {
  res.render('test')
})
router.post('/postloaisp', async (req, res) => {
  try {
    const {
      name,
      manhinh,
      chip,
      ram,
      dungluong,
      camera,
      pinsac,
      hang,
      congsac,
      thongtin
    } = req.body
    const tensp = new LoaiSP.TenSP({
      name,
      manhinh,
      chip,
      ram,
      dungluong,
      camera,
      pinsac,
      hang,
      congsac,
      thongtin
    })
    await tensp.save()
    res.redirect('/main')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/putloaisp/:id', async (req, res) => {
  try {
    const id = req.params.id
    const {
      name,
      manhinh,
      chip,
      ram,
      dungluong,
      camera,
      pinsac,
      hang,
      congsac,
      thongtin
    } = req.body
    await LoaiSP.TenSP.findByIdAndUpdate(id, {
      name,
      manhinh,
      chip,
      ram,
      dungluong,
      camera,
      pinsac,
      hang,
      congsac,
      thongtin
    })
    res.redirect('/main')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/editloaisp/:id', async (req, res) => {
  try {
    const id = req.params.id
    const tensp = await LoaiSP.TenSP.findById(id)
    res.render('editloaisp', { tensp })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/addloaisp', async (req, res) => {
  try {
    res.render('addloaisp')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/addsp/:idloaisp', async (req, res) => {
  try {
    const idloaisp = req.params.idloaisp
    res.render('add', { idloaisp })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/main', checkAuth, async (req, res) => {
  try {
    let listloai = await LoaiSP.TenSP.find()
    let listblog = await myMDBlog.blogModel.find()
    const loailinhkien = await LoaiLinkKien.loailinkkien.find()
    res.render('home', { listloai, listblog, loailinhkien })
  } catch (error) {
    console.log(`lỗi: ${error}`)
  }
})

router.get('/', async (req, res) => {
  try {
    const allsp = await LoaiSP.TenSP.find().populate('chitietsp')
    const listBl = await myMDBlog.blogModel.find().sort({ _id: -1 })
    const danhgia = await DanhGia.danhgia.find()

    const sp = await Promise.all(
      allsp.map(async s => {
        let img
        if (s.name === '13 PRO MAX') {
          img = '/img/iphone13.png'
        }
        if (s.name === '12 PRO MAX') {
          img = '/img/iphone12.jpg'
        }
        if (s.name === '14 PRO MAX') {
          img = '/img/iphone14.png'
        }
        if (s.name === '11 PRO MAX') {
          img = '/img/iphone11.jpg'
        }
        return {
          id: s._id,
          name: s.name,
          img: img
        }
      })
    )

    const tenspjson2 = await Promise.all(
      allsp.map(async tensp => {
        if (
          tensp.name === '13 PRO MAX' ||
          tensp.name === '14 PRO MAX'
        ) {
          const chitietspJson = await Promise.all(
            tensp.chitietsp.map(async chitietsp => {
              return {
                id: chitietsp._id,
                name: chitietsp.name,
                noidung: chitietsp.content,
                price: chitietsp.price,
                image: chitietsp.image
              }
            })
          )
          return {
            id: tensp._id,
            name: tensp.name,
            somay: tensp.chitietsp.length,
            chitietsp: chitietspJson
          }
        }
        return null // Trả về null nếu không thỏa mãn điều kiện
      })
    ).then(results => results.filter(result => result !== null)) // Lọc các phần tử null

    const tenspjson1 = await Promise.all(
      allsp.map(async tensp => {
        if (
          tensp.name === '11 PRO MAX' ||
          tensp.name === '12 PRO MAX'
        ) {
          const chitietspJson1 = await Promise.all(
            tensp.chitietsp.map(async chitietsp => {
              return {
                id: chitietsp._id,
                name: chitietsp.name,
                noidung: chitietsp.content,
                price: chitietsp.price,
                image: chitietsp.image
              }
            })
          )
          return {
            id1: tensp._id,
            name1: tensp.name,
            somay1: tensp.chitietsp.length,
            chitietsp1: chitietspJson1
          }
        }
        return null // Trả về null nếu không thỏa mãn điều kiện
      })
    ).then(results => results.filter(result => result !== null)) // Lọc các phần tử null

    const danhgiaIsReadTrue = danhgia
      .filter(d => d.isRead === true)
      .map(d => ({
        _id: d._id,
        tenkhach: d.tenkhach,
        content: d.content,
        rating: d.rating
      }))

    res.render('index', {
      allsp,
      tenspjson1,
      tenspjson2,
      listBl,
      danhgiaIsReadTrue,
      sp
    })
    console.log(tenspjson1)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/deleteloaisp/:id', async (req, res) => {
  try {
    const id = req.params.id
    const xam = await LoaiSP.TenSP.findById(id)
    if (!xam) {
      res.status(403).json({ message: 'khong tim thay sp' })
    }
    await Promise.all(
      xam.chitietsp.map(async chitietsp => {
        await Sp.ChitietSp.findByIdAndDelete(chitietsp._id)
      })
    )
    await LoaiSP.TenSP.deleteOne({ _id: id })
    res.redirect('/main')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/postchitietsp/:id', upload.single('image'), async (req, res) => {
  try {
    const id = req.params.id
    const { name, content, price } = req.body
    const image = req.file.buffer.toString('base64')
    const chitietsp = new Sp.ChitietSp({ image, name, content, price })
    const tensp = await LoaiSP.TenSP.findById(id)
    if (!tensp) {
      res.status(403).json({ message: 'khong tim thay tensp' })
    }
    chitietsp.idloaisp = id
    chitietsp.loaisp = tensp.name
    tensp.chitietsp.push(chitietsp._id)
    await chitietsp.save()
    await tensp.save()
    res.redirect('/main')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/getchitietsp/:idloaisp', async (req, res) => {
  try {
    const idloaisp = req.params.idloaisp
    const loaisp = await LoaiSP.TenSP.findById(idloaisp)
    if (!loaisp) {
      return res.status(404).json({ message: 'Không tìm thấy loại sản phẩm' })
    }

    const chitiet = await Promise.all(
      loaisp.chitietsp.map(async ct => {
        const chitietsp = await Sp.ChitietSp.findById(ct._id)
        return {
          _id: chitietsp._id,
          image: chitietsp.image,
          name: chitietsp.name,
          content: chitietsp.content,
          price: chitietsp.price
        }
      })
    )
    res.render('chitietsp', { chitiet, idloaisp })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/getspchitiet/:nameloaisp', async (req, res) => {
  try {
    const nameloaisp = req.params.nameloaisp.replace(/-/g, ' ')
    const loaisp = await LoaiSP.TenSP.findOne({ name: nameloaisp })
    const allsp = await LoaiSP.TenSP.find().populate('chitietsp')
    if (!loaisp) {
      return res.status(404).json({ message: 'Không tìm thấy loại sản phẩm' })
    }
    const sp = await Promise.all(
      allsp.map(async s => {
        let img
        if (s.name === 'iPhone 13 Pro Max') {
          img = 'https://www.giahuystore.com/img/iphone13.png'
        }
        if (s.name === 'iPhone 12 Pro Max') {
          img = 'https://www.giahuystore.com/img/iphone12.jpg'
        }
        if (s.name === 'iPhone 14 Pro Max') {
          img = 'https://www.giahuystore.com/img/iphone14.png'
        }
        if (s.name === 'iPhone 11 Pro Max') {
          img = 'https://www.giahuystore.com/img/iphone11.jpg'
        }
        return {
          id: s._id,
          name: s.name,
          img: img
        }
      })
    )

    const chitiet = await Promise.all(
      loaisp.chitietsp.map(async ct => {
        const chitietsp = await Sp.ChitietSp.findById(ct._id)
        return {
          _id: chitietsp._id,
          image: chitietsp.image,
          name: chitietsp.name,
          content: chitietsp.content,
          price: chitietsp.price
        }
      })
    )
    res.render('full', { chitiet, nameloaisp, allsp, sp })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/getchitiet/:namesp/:nameloai', async (req, res) => {
  try {
    const namesp = req.params.namesp.replace(/-/g, ' ')
    const nameloai = req.params.nameloai.replace(/-/g, ' ')
    const sp = await Sp.ChitietSp.findOne({ name: namesp })
    const listBl = await myMDBlog.blogModel.find().sort({ _id: -1 })

    const allsp = await LoaiSP.TenSP.find().populate('chitietsp')

    if (!sp) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
    }
    const loai = await LoaiSP.TenSP.findOne({ name: nameloai })
    if (!loai) {
      return res.status(404).json({ message: 'Không tìm thấy loại sản phẩm' })
    }
    const spjson = {
      image: sp.image,
      name: sp.name,
      price: sp.price,
      content: sp.content,
      manhinh: loai.manhinh,
      chip: loai.chip,
      ram: loai.ram,
      dungluong: loai.dungluong,
      camera: loai.camera,
      pinsac: loai.pinsac,
      congsac: loai.congsac,
      hang: loai.hang,
      thongtin: loai.thongtin
    }
    const mangloai = await Promise.all(
      sp.chitiet.map(async mang => {
        return {
          name: mang.name,
          price: mang.price
        }
      })
    )

    const mangjson = {
      spjson: spjson,
      mangloai: mangloai
    }
    // res.json(mangjson)
    res.render('detail', { mangjson, allsp, listBl })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/postloaichitiet/:chitietspid', async (req, res) => {
  try {
    const chitietspid = req.params.chitietspid
    const { name, price } = req.body
    const chitietsp = await Sp.ChitietSp.findById(chitietspid)
    chitietsp.chitiet.push({ name, price })
    await chitietsp.save()
    res.redirect(`/getloaichitiet/${chitietspid}`)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/editloaichitiet/:chitietspid/:id', async (req, res) => {
  try {
    const chitietspid = req.params.chitietspid
    const { name, price } = req.body
    const chitietsp = await Sp.ChitietSp.findById(chitietspid)
    const id = req.params.id
    const index = chitietsp.chitiet.findIndex(
      item => item._id.toString() === id
    )
    if (index !== -1) {
      chitietsp.chitiet[index].name = name
      chitietsp.chitiet[index].price = price
    } else {
      return res
        .status(404)
        .json({ message: 'Không tìm thấy id trong danh sách chitiet' })
    }

    await chitietsp.save()

    res.redirect(`/getloaichitiet/${chitietspid}`)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/geteditloaichitiet/:chitietspid/:id', async (req, res) => {
  try {
    const chitietspid = req.params.chitietspid
    const id = req.params.id
    const chitietsp = await Sp.ChitietSp.findById(chitietspid)
    const index = chitietsp.chitiet.findIndex(
      item => item._id.toString() === id
    )
    const json = {
      name: chitietsp.chitiet[index].name,
      price: chitietsp.chitiet[index].price
    }

    res.render('editloaichitiet', { chitietspid, id, json })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/deleteloaichitiet/:chitietspid/:id', async (req, res) => {
  try {
    const chitietspid = req.params.chitietspid
    const id = req.params.id
    const chitietsp = await Sp.ChitietSp.findById(chitietspid)
    const updatedChitiet = chitietsp.chitiet.filter(item => item._id != id)

    chitietsp.chitiet = updatedChitiet

    await chitietsp.save()
    res.redirect(`/getloaichitiet/${chitietspid}`)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/getaddloaichitiet/:chitietspid', async (req, res) => {
  try {
    const chitietspid = req.params.chitietspid
    res.render('addloaichitiet', { chitietspid })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/getloaichitiet/:idsp', async (req, res) => {
  try {
    const idsp = req.params.idsp
    const sp = await Sp.ChitietSp.findById(idsp)
    if (!sp) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
    }
    const mangloai = await Promise.all(
      sp.chitiet.map(async mang => {
        return {
          _id: mang._id,
          name: mang.name,
          price: mang.price
        }
      })
    )

    // res.json(mangjson)
    res.render('loaichitietsp', { mangloai, idsp })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/deletechitietsp/:id', async (req, res) => {
  try {
    const id = req.params.id
    const chitietsp = await Sp.ChitietSp.findById(id)
    if (!chitietsp) {
      return res
        .status(404)
        .json({ message: 'Không tìm thấy chi tiết sản phẩm' })
    }
    const loaisp = await LoaiSP.TenSP.findById(chitietsp.idloaisp)
    loaisp.chitietsp = loaisp.chitietsp.filter(
      chitiet => chitiet.toString() !== id
    )
    await loaisp.save()

    await Sp.ChitietSp.deleteOne({ _id: id })

    res.redirect('/main')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/updatechitietsp/:id', async (req, res) => {
  try {
    const id = req.params.id
    const { name, content, price } = req.body

    const chitietsp = await Sp.ChitietSp.findById(id)
    if (!chitietsp) {
      return res
        .status(404)
        .json({ message: 'Không tìm thấy chi tiết sản phẩm' })
    }

    chitietsp.content = content
    chitietsp.price = price
    chitietsp.name = name

    await chitietsp.save()

    res.redirect('/main')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/editsp/:id', async (req, res) => {
  try {
    const id = req.params.id
    const sp = await Sp.ChitietSp.findById(id)
    res.render('edit', { sp })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/suachua', async (req, res) => {
  try {
    const loailinhkien = await LoaiLinkKien.loailinkkien
      .find()
      .populate('linhkien')
    const loailinhkienjson = await Promise.all(
      loailinhkien.map(async loai => {
        const linkkienJson = await Promise.all(
          loai.linhkien.map(async lk => {
            return {
              id: lk._id,
              name: lk.name,
              price: lk.price,
              image: lk.image
            }
          })
        )
        return {
          id: loai._id,
          name: loai.name,
          linkkienJson: linkkienJson
        }
      })
    )
    // res.json(loailinhkienjson)
    res.render('linkkien', { loailinhkienjson })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post(
  '/postlinkkien/:idloailinkkien',
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, price } = req.body
      const idloailinkkien = req.params.idloailinkkien
      const loailinhkien = await LoaiLinkKien.loailinkkien.findById(
        idloailinkkien
      )
      const image = req.file.buffer.toString('base64')
      const linkkien = new LinkKien.linkkien({ name, price, image })
      linkkien.loailinhkien = loailinhkien._id
      linkkien.loai = loailinhkien.name
      loailinhkien.linhkien.push(linkkien._id)
      await linkkien.save()
      await loailinhkien.save()
      res.redirect(`/linhkien/${idloailinkkien}`)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
    }
  }
)

router.get('/addlinhkien/:id', async (req, res) => {
  try {
    const id = req.params.id
    res.render('addlinhkien', { id })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/editlinhkien/:id', async (req, res) => {
  try {
    const id = req.params.id
    const linhkien = await LinkKien.linkkien.findById(id)
    res.render('editlinhkien', { linhkien, id })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/putlinhkien/:id', async (req, res) => {
  try {
    const id = req.params.id
    const { name, price } = req.body
    const linhkien = await LinkKien.linkkien.findById(id)
    linhkien.name = name
    linhkien.price = price
    await linhkien.save()
    res.redirect(`/linhkien/${linhkien.loailinhkien}`)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/deletelk/:id', async (req, res) => {
  try {
    const id = req.params.id
    const linhkien = await LinkKien.linkkien.findById(id)
    const loailinhkien = await LoaiLinkKien.loailinkkien.findById(
      linhkien.loailinhkien
    )
    loailinhkien.linhkien = loailinhkien.linhkien.filter(
      chitiet => chitiet.toString() !== id
    )
    await loailinhkien.save()

    await LinkKien.linkkien.deleteOne({ _id: id })

    res.redirect(`/linhkien/${linhkien.loailinhkien}`)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})
router.post('/postloailinkien', async (req, res) => {
  try {
    const { name } = req.body
    const loailinkkien = new LoaiLinkKien.loailinkkien({ name })
    await loailinkkien.save()
    res.redirect('/main')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/putloailk/:id', async (req, res) => {
  try {
    const id = req.params.id
    const { name } = req.body
    const loailinhkien = await LoaiLinkKien.loailinkkien.findById(id)
    loailinhkien.name = name
    await loailinhkien.save()
    res.redirect('/main')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/deleteloailk/:id', async (req, res) => {
  try {
    const id = req.params.id
    const loailinhkien = await LoaiLinkKien.loailinkkien.findById(id)
    Promise.all(
      loailinhkien.linhkien.map(async linhkien => {
        await LinkKien.linkkien.findByIdAndDelete(linhkien._id)
      })
    )
    await LoaiLinkKien.loailinkkien.deleteOne({ _id: id })
    res.redirect('/main')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/addloailk', async (req, res) => {
  try {
    res.render('addloailinhkien')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/editloailk/:id', async (req, res) => {
  try {
    const id = req.params.id
    const loailinhkien = await LoaiLinkKien.loailinkkien.findById(id)
    res.render('editloailinhkien', { id, loailinhkien })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/linhkien/:id', async (req, res) => {
  try {
    const id = req.params.id
    const loailinhkien = await LoaiLinkKien.loailinkkien.findById(id)
    const linhkienjson = await Promise.all(
      loailinhkien.linhkien.map(async lk => {
        const linhkien = await LinkKien.linkkien.findById(lk._id)
        return {
          _id: linhkien.id,
          name: linhkien.name,
          price: linhkien.price,
          image: linhkien.image,
          loai: linhkien.loai
        }
      })
    )
    res.render('linhkienmain', { linhkienjson, id })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/xemlinhkien/:id', async (req, res) => {
  try {
    const id = req.params.id
    const loailinhkien = await LoaiLinkKien.loailinkkien.findById(id)
    const linhkienjson = await Promise.all(
      loailinhkien.linhkien.map(async lk => {
        const linhkien = await LinkKien.linkkien.findById(lk._id)
        return {
          _id: linhkien.id,
          name: linhkien.name,
          price: linhkien.price,
          image: linhkien.image,
          loai: linhkien.loai
        }
      })
    )
    res.render('xemlinhkien', { linhkienjson, id })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/muangay/:idsp', async (req, res) => {
  try {
    const idsp = req.params.idsp
    const sp = await Sp.ChitietSp.findById(idsp)
    const spjson = {
      name: sp.name,
      price: sp.price
    }
    res.render('formmua', { spjson })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/postnotify', async (req, res) => {
  try {
    const { tenkhach, phone, email, tensp, price, address } = req.body
    const vietnamTime = momenttimezone().toDate()
    const notify = new Notify.notify({
      tenkhach,
      phone,
      email,
      tensp,
      price,
      address
    })
    const sp = await Sp.ChitietSp.findOne({ name: tensp })
    notify.idsp = sp._id
    notify.date = vietnamTime
    await notify.save()
    setTimeout(() => {
      res.redirect('/')
    }, 3000)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/duyet/:idnotify', async (req, res) => {
  try {
    const idnotify = req.params.idnotify
    const notify = await Notify.notify.findById(idnotify)
    notify.isRead = true
    await notify.save()
    res.redirect('/donhang')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/donhang', async (req, res) => {
  try {
    const donhang = await Notify.notify.find()

    const donHangIsReadTrue = donhang
      .filter(d => d.isRead === true)
      .map(d => ({
        _id: d._id,
        tenkhach: d.tenkhach,
        phone: d.phone,
        email: d.email,
        address: d.address,
        tensp: d.tensp,
        price: d.price,
        date: moment(d.date).format('DD/MM/YYYY HH:mm:ss')
      }))

    const donHangIsReadFalse = donhang
      .filter(d => d.isRead === false)
      .map(d => ({
        _id: d._id,
        tenkhach: d.tenkhach,
        phone: d.phone,
        email: d.email,
        address: d.address,
        tensp: d.tensp,
        price: d.price,
        date: moment(d.date).format('DD/MM/YYYY HH:mm:ss')
      }))

    res.render('donhang', {
      donHangIsReadTrue,
      donHangIsReadFalse
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/danhgia', async (req, res) => {
  try {
    const { tenkhach, content, rating } = req.body
    const vietnamTime = momenttimezone().toDate()
    const danhgia = new DanhGia.danhgia({
      tenkhach,
      content,
      rating,
      date: vietnamTime
    })
    await danhgia.save()
    res.redirect('/')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/getdanhgia', async (req, res) => {
  try {
    const danhgia = await DanhGia.danhgia.find()

    const danhgiaIsReadTrue = danhgia
      .filter(d => d.isRead === true)
      .map(d => ({
        _id: d._id,
        tenkhach: d.tenkhach,
        content: d.content,
        rating: d.rating,
        date: moment(d.date).format('DD/MM/YYYY HH:mm:ss')
      }))

    const danhgiaIsReadFalse = danhgia
      .filter(d => d.isRead === false)
      .map(d => ({
        _id: d._id,
        tenkhach: d.tenkhach,
        content: d.content,
        rating: d.rating,
        date: moment(d.date).format('DD/MM/YYYY HH:mm:ss')
      }))

    res.render('danhgia', {
      danhgiaIsReadTrue,
      danhgiaIsReadFalse
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/duyetdanhgia/:iddanhgia', async (req, res) => {
  try {
    const iddanhgia = req.params.iddanhgia
    const danhgia = await DanhGia.danhgia.findById(iddanhgia)
    danhgia.isRead = true
    await danhgia.save()
    res.redirect('/getdanhgia')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/contentBlog/:tieude', async (req, res) => {
  try {
    const tieude_khongdau = decodeURIComponent(req.params.tieude).replace(
      /-/g,
      ' '
    )
    const blog = await myMDBlog.blogModel.findOne({ tieude_khongdau })
    const allsp = await LoaiSP.TenSP.find().populate('chitietsp')

    if (!blog) {
      return res.status(404).json({ message: 'Blog không tồn tại' })
    }

    const listBl = await myMDBlog.blogModel.find().sort({ _id: -1 })

    const content = blog.noidung.map(noidung => {
      return {
        tieude: noidung.tieude || '',
        content: (typeof noidung.content === 'string' ? noidung.content.replace(/\\n/g, '<br>') : '') || '',
        img: noidung.img || ''
      }
    })
    const contentLink = blog.contentLink.map(noidung => {
      return {
        tieude: noidung.tieude,
        noidung: noidung.noidung.map(noidung => {
          return {
            nd: (typeof noidung.nd === 'string' ? noidung.nd.replace(/\\n/g, '<br>') : '') || '',
            a: noidung.a.map(a => {
              return {
                name: a.name,
                link: a.link
              }
            })
          }
        }),
        img: noidung.img
      }
    })

    res.render('chitietblog', {
      content,
      contentLink,
      tieude: blog.tieude_blog,
      listBl,
      image_blog: blog.img_blog,
      allsp
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/postblog', async (req, res) => {
  try {
    const {
      tieude_blog,
      img,
      content,
      tieude,
      img_blog,
      tieudeLink,
      name,
      link,
      imgLink,
      ndLink
    } = req.body

    const tieude_khongdau = unicode(tieude_blog)
    const blog = new myMDBlog.blogModel({
      tieude_blog,
      img_blog,
      tieude_khongdau
    })

    // Thêm các nội dung blog
    if (Array.isArray(content) && Array.isArray(img) && Array.isArray(tieude)) {
      for (let i = 0; i < content.length; i++) {
        blog.noidung.push({
          content: content[i],
          img: img[i],
          tieude: tieude[i]
        })
      }
    } else {
      blog.noidung.push({ content, img, tieude })
    }

    // Xử lý contentLink và noidung
    let currentContentLinkIndex = -1

    if (Array.isArray(tieudeLink)) {
      for (let i = 0; i < ndLink.length; i++) {
        if (tieudeLink[i] || i === 0 || currentContentLinkIndex === -1) {
          // Khi có tieudeLink mới, hoặc khi đây là lần đầu tiên, tạo một newContentLink mới
          const newContentLink = {
            tieude: tieudeLink[i] || tieudeLink[currentContentLinkIndex],
            img: imgLink[i] || tieudeLink[currentContentLinkIndex],
            noidung: []
          }
          blog.contentLink.push(newContentLink)
          currentContentLinkIndex = blog.contentLink.length - 1
        }

        // Thêm noidung vào contentLink hiện tại
        const newNoidung = {
          nd: Array.isArray(ndLink) ? ndLink[i] : ndLink,
          a: [
            {
              name: Array.isArray(name) ? name[i] : name,
              link: Array.isArray(link) ? link[i] : link
            }
          ]
        }
        blog.contentLink[currentContentLinkIndex].noidung.push(newNoidung)
      }
    } else {
      // Trường hợp tieudeLink không phải là mảng
      const newContentLink = {
        tieude: tieudeLink,
        img: imgLink,
        noidung: []
      }
      const newNoidung = {
        nd: ndLink,
        a: [
          {
            name: name,
            link: link
          }
        ]
      }
      newContentLink.noidung.push(newNoidung)
      blog.contentLink.push(newContentLink)
    }

    await blog.save()
    console.log(blog.contentLink)
    res.redirect('/main')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/getaddblog', async (req, res) => {
  res.render('addblog')
})

router.get('/getblog', async (req, res) => {
  try {
    const listBl = await myMDBlog.blogModel.find().sort({ _id: -1 })
    res.render('blog', { listBl })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})
router.get('/editblog/:idblog', async (req, res) => {
  try {
    const idblog = req.params.idblog
    const blog = await myMDBlog.blogModel.findById(idblog)
    res.render('editBlog', {
      blog
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/editblog/:idblog', async (req, res) => {
  try {
    const { tieude_blog, img_blog, tieude, content, img } = req.body
    const idblog = req.params.idblog
    const blog = await myMDBlog.blogModel.findById(idblog)
    blog.tieude_blog = tieude_blog
    blog.img_blog = img_blog
    blog.tieude_khongdau = unicode(tieude_blog)

    if (Array.isArray(content) && Array.isArray(img) && Array.isArray(tieude)) {
      blog.noidung.forEach((nd, index) => {
        nd.content = content[index]
        nd.img = img[index]
        nd.tieude = tieude[index]
      })

      for (let i = blog.noidung.length; i < content.length; i++) {
        blog.noidung.push({
          content: content[i],
          img: img[i],
          tieude: tieude[i]
        })
      }
    } else {
      blog.noidung.push({ content, img, tieude })
    }

    await blog.save()
    res.redirect('/main')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})
router.post('/editContentLink/:idblog', async (req, res) => {
  try {
    const { tieude_blog, img_blog, tieudeLink, name, link, imgLink, ndLink } =
      req.body
    const idblog = req.params.idblog
    const blog = await myMDBlog.blogModel.findById(idblog)

    if (!blog) {
      return res.status(404).json({ message: 'Blog không tồn tại' })
    }

    // Cập nhật thông tin chính của blog
    if (tieude_blog !== undefined) blog.tieude_blog = tieude_blog
    if (img_blog !== undefined) blog.img_blog = img_blog
    if (tieude_blog !== undefined) blog.tieude_khongdau = unicode(tieude_blog)

    // Xử lý cập nhật hoặc thêm mới các phần tử trong contentLink
    if (Array.isArray(tieudeLink)) {
      // Tạo một map để dễ dàng tra cứu các phần tử contentLink hiện có
      const contentLinkMap = new Map()
      blog.contentLink.forEach(cl => contentLinkMap.set(cl.tieude, cl))

      tieudeLink.forEach((tieude, index) => {
        let contentLink = contentLinkMap.get(tieude)

        if (!contentLink) {
          // Nếu contentLink chưa tồn tại, tạo mới
          contentLink = {
            tieude: tieude || '',
            img: imgLink
              ? Array.isArray(imgLink)
                ? imgLink[index] || ''
                : imgLink
              : '',
            noidung: []
          }
          blog.contentLink.push(contentLink)
          contentLinkMap.set(tieude, contentLink) // Cập nhật map
        } else {
          // Cập nhật các thuộc tính hiện tại của contentLink
          contentLink.tieude = tieude || contentLink.tieude
          contentLink.img = imgLink
            ? Array.isArray(imgLink)
              ? imgLink[index]
              : imgLink
            : contentLink.img
        }

        // Xử lý ndLink, name, và link để đảm bảo chúng là chuỗi
        const nd = Array.isArray(ndLink) ? ndLink[index] || '' : ndLink || ''
        const aName = Array.isArray(name) ? name[index] || '' : name || ''
        const aLink = Array.isArray(link) ? link[index] || '' : link || ''

        // Chuyển đổi mảng thành chuỗi nếu cần
        const newNoidung = {
          nd: nd || '', // Đảm bảo nd là chuỗi
          a: [
            {
              name: aName || '', // Đảm bảo name là chuỗi
              link: aLink || '' // Đảm bảo link là chuỗi
            }
          ]
        }

        // Xóa noidung cũ nếu đã tồn tại và thêm mới
        const noidungIndex = contentLink.noidung.findIndex(
          nd => nd.nd === newNoidung.nd
        )
        if (noidungIndex >= 0) {
          contentLink.noidung[noidungIndex] = newNoidung
        } else {
          contentLink.noidung.push(newNoidung)
        }
      })

      // Xóa các contentLink không còn trong request
      blog.contentLink = blog.contentLink.filter(cl =>
        tieudeLink.includes(cl.tieude)
      )
    } else {
      // Trường hợp tieudeLink không phải là mảng
      const contentLink = {
        tieude: tieudeLink || '',
        img: imgLink || '',
        noidung: [
          {
            nd: ndLink || '',
            a: [
              {
                name: name || '',
                link: link || ''
              }
            ]
          }
        ]
      }
      blog.contentLink = [contentLink]
    }

    await blog.save()
    res.redirect('/main')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})





router.post('/deleteblog/:idblog', async (req, res) => {
  try {
    const idblog = req.params.idblog
    const blog = await myMDBlog.blogModel.findByIdAndDelete(idblog)
    res.redirect('/main')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/cart', async (req, res) => {
  res.render('cart')
})

router.get('/getblog', async (req, res) => {
  try {
    const listBl = await myMDBlog.blogModel.find().sort({ _id: -1 })
    res.render('blog', { listBl })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})
router.get('/editblog/:idblog', async (req, res) => {
  try {
    const idblog = req.params.idblog
    const blog = await myMDBlog.blogModel.findById(idblog)
    res.render('editBlog', {
      blog
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/editContentLink/:idblog', async (req, res) => {
  try {
    const idblog = req.params.idblog
    const blog = await myMDBlog.blogModel.findById(idblog)
    res.render('editContenLink', {
      blog
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})


router.post('/editblog/:idblog', async (req, res) => {
  try {
    const { tieude_blog, img_blog, tieude, content, img } = req.body
    const idblog = req.params.idblog
    const blog = await myMDBlog.blogModel.findById(idblog)
    blog.tieude_blog = tieude_blog
    blog.img_blog = img_blog

    if (Array.isArray(content) && Array.isArray(img) && Array.isArray(tieude)) {
      blog.noidung.forEach((nd, index) => {
        nd.content = content[index]
        nd.img = img[index]
        nd.tieude = tieude[index]
      })

      for (let i = blog.noidung.length; i < content.length; i++) {
        blog.noidung.push({
          content: content[i],
          img: img[i],
          tieude: tieude[i]
        })
      }
    } else {
      blog.noidung.push({ content, img, tieude })
    }

    await blog.save()
    res.redirect('/main')
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})
function removeVietnameseTones (str) {
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D')
  return str
}

router.get('/detail', async (req, res) => {
  res.render('detail')
})
router.get('/test', async (req, res) => {
  res.render('test')
})
router.get('/test1', async (req, res) => {
  res.render('test1')
})
router.get('/test3', async (req, res) => {
  res.render('test3')
})
module.exports = router
