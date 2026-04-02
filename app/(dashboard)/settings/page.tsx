'use client';

import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { changePassword } from '../../actions';

const { Title } = Typography;

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('New password and confirm password do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(values.oldPassword, values.newPassword);
      if (result.error) {
        message.error(result.error);
      } else {
        message.success('Password changed successfully');
        form.resetFields();
      }
    } catch {
      message.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title level={4}>Change Password</Title>
      <Card style={{ maxWidth: 500 }}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Old Password" name="oldPassword" rules={[{ required: true }]}>
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item label="New Password" name="newPassword" rules={[{ required: true, min: 6 }]}>
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true, min: 6 }]}>
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              Update Password
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}
