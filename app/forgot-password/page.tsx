'use client';

import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import Link from 'next/link';
import { forgotPassword } from '../actions';

const { Title } = Typography;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      await forgotPassword(values.email);
      setSent(true);
      message.success('If an account exists with that email, a reset link has been sent.');
    } catch {
      message.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: 'center' }}>Forgot Password</Title>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <p>Check your email for a password reset link.</p>
            <Link href="/login">Back to Login</Link>
          </div>
        ) : (
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
              <Input size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Send Reset Link
              </Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              <Link href="/login">Back to Login</Link>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
}
