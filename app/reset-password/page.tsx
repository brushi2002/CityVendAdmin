'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import Link from 'next/link';
import { resetPassword } from '../actions';

const { Title } = Typography;

function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || '';

  const onFinish = async (values: { newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(code, values.newPassword);
      if (result.error) {
        message.error(result.error);
      } else {
        setDone(true);
        message.success('Password has been reset successfully.');
      }
    } catch {
      message.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p>Your password has been reset.</p>
        <Link href="/login">Go to Login</Link>
      </div>
    );
  }

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item label="New Password" name="newPassword" rules={[{ required: true, min: 6 }]}>
        <Input.Password size="large" />
      </Form.Item>
      <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true, min: 6 }]}>
        <Input.Password size="large" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block size="large">
          Reset Password
        </Button>
      </Form.Item>
      <div style={{ textAlign: 'center' }}>
        <Link href="/login">Back to Login</Link>
      </div>
    </Form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 50px)', background: '#f0f2f5' }}>
      <Card style={{ width: 420, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', borderRadius: 12 }}>
        <Title level={3} style={{ textAlign: 'center' }}>Reset Password</Title>
        <Suspense fallback={<Spin style={{ display: 'block', margin: '20px auto' }} />}>
          <ResetPasswordForm />
        </Suspense>
      </Card>
    </div>
  );
}
