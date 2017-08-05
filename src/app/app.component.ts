import {
  Component,
  ViewEncapsulation,
  HostListener,
  OnInit,
  ViewChild,
  TemplateRef,
  AfterViewInit,
  ElementRef
} from '@angular/core';

@Component({selector: 'app-root', templateUrl: './app.component.html', styleUrls: ['./app.component.css']})
export class AppComponent implements AfterViewInit {
  @ViewChild('label')regionalRef : ElementRef;
  regional : any;
  @ViewChild('get_image')getImageRef : ElementRef;
  getImage : any;
  @ViewChild('edit_pic')clipPicRef : ElementRef;
  clipPic : any;
  @ViewChild('cover_box')coverBoxRef : ElementRef;
  coverBox : any;
  @ViewChild('show_edit')achieveRef : ElementRef;
  achieve: any;

  imgUrl: any;
  ex: any;
  ey: any;
  clipPos = {
    x: 670,
    y: 200,
    height: 100,
    width: 100
  };

  bgPagePos = {
    x: '',
    y: '',
    height: 0,
    width: 0
  };

  constructor(private outboundfaxservice: OutboundfaxService, private commonService: CommonService, private translateService: TranslateService) {}

  // logo 文件上传
  upload(evt: any) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.paintImage(e.target.result);
    };
    reader.readAsDataURL(evt.target.files[0]);
  }

  // 保存后剪切图片
  save() {
    // 绘制剪切后的图片：
    this.clipPic.height = this.clipPos.height;
    this.clipPic.width = this.clipPos.width;

    const ctx = this
      .clipPic
      .getContext('2d');
    const images = new Image();
    images.src = this.imgUrl;
    images.onload = () => {
      // drawImage(images,相对于裁剪图片的X, 相对于裁剪图片的Y, 裁剪的高度, 裁剪的宽度, 显示在画布的X, 显示在画布的Y,
      // 显示在画布多高, 显示在画布多宽);
      ctx.drawImage(images, this.clipPos.x, this.clipPos.y, this.clipPos.height, this.clipPos.width, 0, 0, this.clipPos.height, this.clipPos.width); // 裁剪图片
      // documenthis.getElementById('show_pic').getElementsByTagName('img')[0].src = this.clipPic.toDataURL();
    };
  }

  ngAfterViewInit() {
    this.getImage = this.getImageRef.nativeElement;
    this.coverBox = this.coverBoxRef.nativeElement;
    this.achieve = this.achieveRef.nativeElement;
    this.clipPic = this.clipPicRef.nativeElement;
    this.regional = this.regionalRef.nativeElement;
    this.drag();
  }

  paintImage(url) {
    const createCanvas = this
      .getImage
      .getContext('2d');
    const img = new Image();
    img.src = url;
    img.onload = () => {

      // 等比例缩放图片(如果图片宽高都比容器小，则绘制的图片宽高 = 原图片的宽高。) 如果图片的宽度或者高度比容器大，则宽度或者高度 =
      // 容器的宽度或者高度，另一高度或者宽度则等比例缩放
      // this.imgWidth：绘制后图片的宽度；this.imgHeight：绘制后图片的高度；this.px：绘制后图片的X轴；this.py：绘制后图片
      // 的 Y轴
      if (img.width < this.regional.offsetWidth && img.height < this.regional.offsetHeight) {
        this.bgPagePos.width = img.width;
        this.bgPagePos.height = img.height;
      } else {
        const pWidth = img.width / (img.height / this.regional.offsetHeight);
        const pHeight = img.height / (img.width / this.regional.offsetWidth);
        this.bgPagePos.width = img.width > img.height
          ? this.regional.offsetWidth
          : pWidth;
        this.bgPagePos.height = img.height > img.width
          ? this.regional.offsetHeight
          : pHeight;
      }
      // 图片的坐标
      this.bgPagePos.x = +(this.regional.offsetWidth - this.bgPagePos.width) / 2 + 'px';
      this.bgPagePos.y = +(this.regional.offsetHeight - this.bgPagePos.height) / 2 + 'px';

      this.getImage.height = this.bgPagePos.height;
      this.getImage.width = this.bgPagePos.width;
      this.getImage.style.left = this.bgPagePos.x;
      this.getImage.style.top = this.bgPagePos.y;

      createCanvas.drawImage(img, 0, 0, this.bgPagePos.width, this.bgPagePos.height); // 没用直接插入背景图片而用canvas绘制图片，是为了调整所需框内图片的大小
      this.imgUrl = this
        .getImage
        .toDataURL(); // 储存canvas绘制的图片地址
      this.clipImg();
    };
  }

  clipImg() {
    // 绘制遮罩层：
    this.coverBox.height = this.bgPagePos.height;
    this.coverBox.width = this.bgPagePos.width;
    this.coverBox.style.display = 'block';
    this.coverBox.style.left = this.bgPagePos.x;
    this.coverBox.style.top = this.bgPagePos.y;

    const cover = this
      .coverBox
      .getContext('2d');
    cover.fillStyle = 'rgba(0, 0, 0, 0.5)';
    cover.fillRect(0, 0, this.bgPagePos.width, this.bgPagePos.height);
    cover.clearRect(0, 0, this.clipPos.width, this.clipPos.height);

    this.achieve.style.background = 'url(' + this.imgUrl + ')' + -this.clipPos.x + 'px ' + -this.clipPos.y + 'px no-repeat';
    this.achieve.style.height = this.clipPos.height + 'px';
    this.achieve.style.width = this.clipPos.width + 'px';
  }

  drag() {
    let draging = false;
    let _startPos = null;

    this.coverBox.onmousemove = (e) => {
      e = e || window.event;

      if (e.pageX == null && e.clientX != null) {

        const doc = document.documentElement,
          body = document.body;

        e.pageX = e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
        e.pageY = e.clientY + (doc && doc.scrollTop || body && body.scrollTop);
      }

      // 获取鼠标到背景图片的距离
      const _mousePos = {
        left: e.pageX - (this.regional.offsetLeft + this.coverBox.offsetLeft),
        top: e.pageY - (this.regional.offsetTop + this.coverBox.offsetTop)
      };

      // 判断鼠标是否在裁剪区域里面：
      if (_mousePos.left > this.clipPos.x && _mousePos.left < this.clipPos.x + this.clipPos.width && _mousePos.top > this.clipPos.y && _mousePos.top < this.clipPos.y + this.clipPos.height) {
        this.coverBox.style.cursor = 'move';

        this.coverBox.onmousedown = () => {
          draging = true;
          // 记录上一次截图的坐标
          this.ex = this.clipPos.x;
          this.ey = this.clipPos.y;

          // 记录鼠标按下时候的坐标
          _startPos = {
            left: e.pageX - (this.regional.offsetLeft + this.coverBox.offsetLeft),
            top: e.pageY - (this.regional.offsetTop + this.coverBox.offsetTop)
          };
        };

        if (draging) {
          // 移动时裁剪区域的坐标 = 上次记录的定位 + (当前鼠标的位置 - 按下鼠标的位置)，裁剪区域不能超出遮罩层的区域;
          if (this.ex + (_mousePos.left - _startPos.left) < 0) {
            this.clipPos.width = 0;
          } else if (this.ex + (_mousePos.left - _startPos.left) + this.clipPos.width > this.bgPagePos.width) {
            this.clipPos.width = this.bgPagePos.width - this.clipPos.width;
          } else {
            this.clipPos.width = this.ex + (_mousePos.left - _startPos.left);
          };

          if (this.ey + (_mousePos.top - _startPos.top) < 0) {
            this.clipPos.height = 0;
          } else if (this.ey + (_mousePos.top - _startPos.top) + this.clipPos.height > this.bgPagePos.height) {
            this.clipPos.height = this.bgPagePos.height - this.clipPos.height;
          } else {
            this.clipPos.height = this.ey + (_mousePos.top - _startPos.top);
          }

          this.clipImg();
        }

        document.body.onmouseup = () => {
          draging = false;
          document.onmousemove = null;
          document.onmouseup = null;
        };
      } else {
        this.coverBox.style.cursor = 'auto';
      }
    };
  };
}
