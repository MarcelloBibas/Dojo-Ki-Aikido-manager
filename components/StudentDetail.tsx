
import React, { useState, useEffect, useRef } from 'react';
import { Student, Rank, Exam, Payment } from '../types';
import { RANKS_ORDERED } from '../constants';
import { ArrowLeftIcon, WhatsAppIcon, CameraIcon } from './Icons';

interface StudentDetailProps {
  student: Student;
  onSave: (student: Student) => void;
  onBack: () => void;
  onDeletePhoto: (studentId: string, photoIndex: number) => void;
}

// Added [color-scheme:light] dark:[color-scheme:dark] to fix date picker visibility
const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input {...props} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-dojo-blue-500 focus:border-dojo-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]" />
    </div>
);

export const StudentDetail: React.FC<StudentDetailProps> = ({ student, onSave, onBack, onDeletePhoto }) => {
  const [formData, setFormData] = useState<Student>(student);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setFormData({
        ...student,
        // Sort exams in ascending order (oldest first)
        exams: [...student.exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        // Sort payments in descending order (newest first)
        payments: [...student.payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    });
  }, [student]);
  
  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, []);

  const handleChange = <K extends keyof Student>(field: K, value: Student[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  // Helper to resize and compress images
  const processImage = (dataUrl: string, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }
            } else {
                if (height > maxWidth) {
                    width = Math.round(width * (maxWidth / height));
                    height = maxWidth;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            } else {
                resolve(dataUrl); // Fallback
            }
        };
        img.onerror = () => resolve(dataUrl); // Fallback
    });
  };
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files: File[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files.item(i);
        if (file) {
          files.push(file);
        }
      }

      if (files.length === 0) {
        return;
      }
      
      const filePromises = files.map((file) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              // Compress uploaded file
              processImage(reader.result).then(resolve);
            } else {
              reject(new Error('Failed to read file as data URL.'));
            }
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises)
        .then((base64Images) => {
          setFormData((prev) => ({
            ...prev,
            photos: [...prev.photos, ...base64Images],
          }));
        })
        .catch((error) => console.error('Error reading files:', error));
    }
  };

  const openCamera = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }) // Prefer back camera on mobile
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                    setIsCameraOpen(true);
                }
            })
            .catch(err => {
                console.error("Error accessing camera: ", err);
                alert("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
            });
    }
  };

  const closeCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraOpen(false);
  };

  const handleCapture = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          
          // Resize logic for camera capture
          const MAX_DIMENSION = 800;
          let width = video.videoWidth;
          let height = video.videoHeight;

          if (width > height) {
              if (width > MAX_DIMENSION) {
                  height = Math.round(height * (MAX_DIMENSION / width));
                  width = MAX_DIMENSION;
              }
          } else {
              if (height > MAX_DIMENSION) {
                  width = Math.round(width * (MAX_DIMENSION / height));
                  height = MAX_DIMENSION;
              }
          }

          canvas.width = width;
          canvas.height = height;
  
          const context = canvas.getContext('2d');
          if (context) {
              context.drawImage(video, 0, 0, width, height);
              // Compress to JPEG with 0.7 quality to save space
              const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
              handleChange('photos', [...formData.photos, dataUrl]);
              closeCamera();
          }
      }
  };

  const addExam = () => {
    const newExam: Exam = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], rank: Rank.Kyu5 };
    handleChange('exams', [...formData.exams, newExam].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const handleExamChange = (index: number, field: keyof Exam, value: string) => {
    const updatedExams = [...formData.exams];
    updatedExams[index] = { ...updatedExams[index], [field]: value };
    handleChange('exams', updatedExams.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const removeExam = (index: number) => {
      handleChange('exams', formData.exams.filter((_, i) => i !== index));
  }

  const addPayment = () => {
    const newPayment: Payment = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], amount: 100.00 };
    handleChange('payments', [...formData.payments, newPayment].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handlePaymentChange = (index: number, field: keyof Payment, value: string | number) => {
    const updatedPayments = [...formData.payments];
    updatedPayments[index] = { ...updatedPayments[index], [field]: value };
    handleChange('payments', updatedPayments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
    
  const removePayment = (index: number) => {
        handleChange('payments', formData.payments.filter((_, i) => i !== index));
    }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 z-10">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <ArrowLeftIcon className="h-6 w-6"/>
            </button>
            <div className="flex items-center space-x-2">
                <label htmlFor="admin-toggle" className="text-sm font-medium">Modo Admin</label>
                <input
                    id="admin-toggle"
                    type="checkbox"
                    checked={isAdmin}
                    onChange={() => setIsAdmin(!isAdmin)}
                    className="h-4 w-4 rounded border-gray-300 text-dojo-blue-600 focus:ring-dojo-blue-500"
                />
            </div>
            <button
                onClick={handleSubmit}
                disabled={!isAdmin}
                className="px-4 py-2 bg-dojo-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-dojo-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Salvar
            </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-dojo-blue-800 dark:text-dojo-blue-300">Informações Pessoais</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Nome" value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)} disabled={!isAdmin} />
                    <InputField label="Sobrenome" value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)} disabled={!isAdmin} />
                    <InputField label="Data de Nascimento" type="date" value={formData.dob} onChange={e => handleChange('dob', e.target.value)} disabled={!isAdmin} />
                    <InputField label="Data de Início" type="date" value={formData.startDate} onChange={e => handleChange('startDate', e.target.value)} disabled={!isAdmin} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Celular (com DDD)</label>
                        <div className="flex items-center">
                            <input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} disabled={!isAdmin} className="flex-grow w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-dojo-blue-500 focus:border-dojo-blue-500 sm:text-sm text-gray-900 dark:text-gray-100" />
                            <a href={`https://wa.me/55${formData.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="ml-2 p-2 bg-green-500 text-white rounded-full hover:bg-green-600">
                                <WhatsAppIcon className="h-5 w-5"/>
                            </a>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        <select value={formData.status} onChange={e => handleChange('status', e.target.value as any)} disabled={!isAdmin} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-dojo-blue-500 focus:border-dojo-blue-500 sm:text-sm text-gray-900 dark:text-gray-100">
                            <option value="Active">Ativo</option>
                            <option value="Inactive">Inativo</option>
                            <option value="Professor">Professor</option>
                        </select>
                    </div>
                </div>
            </section>
            
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-dojo-blue-800 dark:text-dojo-blue-300">Fotos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                            <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-32 object-cover rounded-md"/>
                            {isAdmin && <button type="button" onClick={() => onDeletePhoto(formData.id, index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">X</button>}
                        </div>
                    ))}
                </div>
                {isAdmin && (
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:space-x-4 space-y-4 sm:space-y-0">
                      <div>
                          <label htmlFor="photo-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adicionar via Arquivo</label>
                          <input id="photo-upload" type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-dojo-blue-50 file:text-dojo-blue-700 hover:file:bg-dojo-blue-100 dark:file:bg-dojo-blue-900/50 dark:file:text-dojo-blue-300 dark:hover:file:bg-dojo-blue-900"/>
                      </div>
                      {'mediaDevices' in navigator && navigator.mediaDevices.getUserMedia && (
                          <button type="button" onClick={openCamera} className="flex items-center justify-center px-4 py-2 bg-dojo-blue-500 text-white font-semibold rounded-lg shadow-sm hover:bg-dojo-blue-600">
                              <CameraIcon className="h-5 w-5 mr-2"/>
                              Tirar Foto
                          </button>
                      )}
                  </div>
                )}
            </section>

            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 text-dojo-blue-800 dark:text-dojo-blue-300">Histórico de Exames</h2>
                <div className="space-y-4">
                    {formData.exams.map((exam, index) => (
                        <div key={exam.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <input type="date" value={exam.date} onChange={e => handleExamChange(index, 'date', e.target.value)} disabled={!isAdmin} className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md sm:text-sm text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"/>
                            <select value={exam.rank} onChange={e => handleExamChange(index, 'rank', e.target.value)} disabled={!isAdmin} className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md sm:text-sm text-gray-900 dark:text-gray-100">
                                {RANKS_ORDERED.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            {isAdmin && <button type="button" onClick={() => removeExam(index)} className="px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-md">Remover</button>}
                        </div>
                    ))}
                </div>
                {isAdmin && <button type="button" onClick={addExam} className="mt-4 px-4 py-2 bg-dojo-blue-500 text-white font-semibold rounded-lg shadow-sm hover:bg-dojo-blue-600">Adicionar Exame</button>}
            </section>

            {student.status !== 'Professor' && (
                <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4 text-dojo-blue-800 dark:text-dojo-blue-300">Histórico de Pagamentos</h2>
                    <div className="space-y-4">
                        {formData.payments.map((payment, index) => (
                            <div key={payment.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                <input type="date" value={payment.date} onChange={e => handlePaymentChange(index, 'date', e.target.value)} disabled={!isAdmin} className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md sm:text-sm text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"/>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">R$</span>
                                    <input type="number" step="0.01" value={payment.amount} onChange={e => handlePaymentChange(index, 'amount', parseFloat(e.target.value))} disabled={!isAdmin} className="pl-10 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md sm:text-sm text-gray-900 dark:text-gray-100"/>
                                </div>
                                {isAdmin && <button type="button" onClick={() => removePayment(index)} className="px-3 py-2 bg-red-500 text-white text-sm font-medium rounded-md">Remover</button>}
                            </div>
                        ))}
                    </div>
                    {isAdmin && <button type="button" onClick={addPayment} className="mt-4 px-4 py-2 bg-dojo-blue-500 text-white font-semibold rounded-lg shadow-sm hover:bg-dojo-blue-600">Adicionar Pagamento</button>}
                </section>
            )}
        </form>

        {isCameraOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl max-w-lg w-full m-4">
                    <video ref={videoRef} className="w-full rounded-md" playsInline></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <div className="flex justify-center space-x-4 mt-4">
                        <button type="button" onClick={handleCapture} className="px-6 py-2 bg-dojo-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-dojo-blue-700">Capturar</button>
                        <button type="button" onClick={closeCamera} className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-sm hover:bg-gray-700">Cancelar</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
