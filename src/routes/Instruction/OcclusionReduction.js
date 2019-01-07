import React from 'react';
import { connect } from 'dva';
import { Icon, Form, Input, Button, Row, Col, Upload, message } from 'antd';
import styles from './style.less';
import RequestBasicTable from '../../components/InstructionTable/RequestBasicTable';
import RequestBodyTable from '../../components/InstructionTable/RequestBodyTable';
import ResponseBodyTable from '../../components/InstructionTable/ResponseBodyTable';
import CodeBlock from '../../components/CodeBlock';

// 请求头部、方法
const requestBasicData = [{
    param: 'URL',
    value: 'http://aiop.bupt.com/restapi/image/v1/occlusion_reduction',
}, {
    param: 'Method',
    value: 'POST',
}, {
    param: 'Content-Type',
    value: 'application/json',
}, {
    param: 'access_token',
    value: <span>通过API Key和Secret Key获取的access_token，参考<a href="/instruction/access-token">令牌获取</a></span>,
}];

// 请求参数实体
const requestBodyData = [{
    param: 'img',
    type: 'string',
    mandatory: <Icon type="check" />,
    description: '遮挡图像（Base64编码形式）',
}];

// 请求示例代码
const requestCodeData = `{
    "img": "iVBORw0KGgoAAAANSUh...+sUq/j8Uf/0z6s8T6AAAAABJRU5ErkJggg=="
}`;

// 返回参数实体
const responseBodyData = [{
    param: 'img',
    type: 'string',
    description: '还原后图像(Base64编码形式)',
}];

// 返回示例代码
const responseCodeData = `{
    "img": "/9j/4AAQSkZJRgABAQE...8Nvurrd4SpGuO3gBMJO854GEzcQeVA//2Q=="
}`;

@connect(state => ({
    instruction: state.instruction,
}))
@Form.create()
export default class OcclusionReduction extends React.Component {

    state = {
        loading: false,
        imageUrl: undefined,
    };

    // 清空调用结果框中内容
    componentWillUnmount = () => {
        this.props.dispatch({ type: 'instruction/changeResult', payload: '' });
    }

    // 请求调用能力的api
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields({ force: true },
            (err) => {
                if (!err) {
                    const pureImg = this.pureBase64(this.state.imageUrl);
                    this.props.dispatch({ type: 'instruction/invokeOcclusionReduction', payload: { img: pureImg } });
                }
            }
        );
    }

    /**
    * 图片上传相关
    */
    pureBase64 = (mixedBase64) => {
        return mixedBase64.split(',')[1];
    }

    // 图片编码
    getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    }

    // 上传校验
    beforeUpload = (file) => {
        const isPic = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/svg+xml';
        if (!isPic) {
            message.error('只能上传后缀为jpg、jpeg、png和svg的图片文件!', 2);
        }
        const isLt2M = file.size / 1024 / 1024 < 10;
        if (!isLt2M) {
            message.error('图片大小必须小于10MB!', 2);
        }
        return isPic && isLt2M;
    }

    // 上传状态改变
    handleChangeImage = (info) => {
        this.getBase64(info.file.originFileObj, imageUrl => this.setState({ imageUrl }));
    }

    render() {
        const { instruction } = this.props;
        const formItemLayout = { labelCol: { span: 24 }, wrapperCol: { span: 24 } };
        return (
            <div>
                <h1>图像遮挡还原</h1>

                <h2>接口描述</h2>
                <p>将图像被遮挡的部分修复重绘出来</p>

                <h2>请求说明</h2>
                <h3>请求描述</h3>
                <RequestBasicTable data={requestBasicData} />

                <h3>请求参数</h3>
                <RequestBodyTable data={requestBodyData} />

                <h3>请求示例</h3>
                <CodeBlock data={requestCodeData} />

                <h2>返回说明</h2>
                <h3>返回参数</h3>
                <ResponseBodyTable data={responseBodyData} />

                <h3>返回示例</h3>
                <CodeBlock data={responseCodeData} />

                <h2>调用测试</h2>

                <Row gutter={10}>
                    <Col span={5}>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Item label="遮挡图像" {...formItemLayout}>
                                <Upload
                                    name="file"
                                    listType="picture-card"
                                    showUploadList={false}
                                    beforeUpload={this.beforeUpload}
                                    onChange={this.handleChangeImage}
                                >
                                    {this.state.imageUrl ? <img src={this.state.imageUrl} alt="" className={styles.imageView} /> : <div className={styles.imageView}><Icon type={this.state.loading ? 'loading' : 'plus'} /></div>}
                                </Upload>
                            </Form.Item>
                            <Form.Item {...formItemLayout}>
                                <Button type="primary" htmlType="submit" loading={instruction.submitting}>提交</Button>
                            </Form.Item>
                        </Form>
                    </Col>

                    <Col span={5}>
                        <Form.Item label="还原后图像" {...formItemLayout}>
                            <Upload listType="picture-card" style={{ cursor: 'none' }} disabled>
                                {instruction.imageResult ? <img src={instruction.imageResult} alt="" className={styles.imageView} /> : <div className={styles.imageView} />}
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>
            </div>
        );
    }
}
