import React from "react";
import { Bell, Shield, User, Globe, Palette, Camera, MapPin, Briefcase, Calendar, Check } from "lucide-react";
import { cn } from "../lib/utils";
import { UserProfile } from "../types";
import { DEFAULT_AVATARS } from "../constants";

interface SettingsProps {
  alertDays: number[];
  onUpdateAlertDays: (days: number[]) => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
}

export function Settings({ alertDays, onUpdateAlertDays, userProfile, onUpdateProfile }: SettingsProps) {
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [tempProfile, setTempProfile] = React.useState<UserProfile>(userProfile);
  const availableDays = [1, 2, 3, 5, 7, 10, 15];

  const toggleDay = (day: number) => {
    if (alertDays.includes(day)) {
      onUpdateAlertDays(alertDays.filter((d) => d !== day));
    } else {
      onUpdateAlertDays([...alertDays, day].sort((a, b) => a - b));
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(tempProfile);
    setIsEditingProfile(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display tracking-tight">Configurações</h2>
          <p className="text-slate-500 mt-1">Gerencie suas preferências e alertas do sistema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {isEditingProfile ? (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animate-in zoom-in duration-300">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-display">Editar Perfil</h3>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group mb-6">
                    <img 
                      src={tempProfile.photoUrl || "https://picsum.photos/seed/user/200/200"} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-3xl object-cover border-4 border-slate-50 shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <div className="w-full space-y-4">
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-bold text-center">Escolha um Avatar</p>
                    <div className="flex flex-wrap justify-center gap-3 p-4 bg-slate-50 rounded-[32px]">
                      {DEFAULT_AVATARS.map((avatar, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTempProfile({ ...tempProfile, photoUrl: avatar })}
                          className={cn(
                            "relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all hover:scale-110",
                            tempProfile.photoUrl === avatar ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-transparent opacity-60 hover:opacity-100"
                          )}
                        >
                          <img src={avatar} alt={`Avatar ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          {tempProfile.photoUrl === avatar && (
                            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                              <Check className="w-4 h-4 text-emerald-600" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ou cole a URL de uma imagem</label>
                      <input 
                        type="text" 
                        placeholder="https://exemplo.com/foto.jpg"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none text-xs focus:ring-2 focus:ring-emerald-500 transition-all"
                        value={tempProfile.photoUrl?.startsWith('https://api.dicebear.com') ? '' : tempProfile.photoUrl}
                        onChange={(e) => setTempProfile({ ...tempProfile, photoUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Nome Completo</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      value={tempProfile.name}
                      onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">E-mail</label>
                    <input 
                      type="email" 
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      value={tempProfile.email}
                      onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Profissão</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                        value={tempProfile.profession}
                        onChange={(e) => setTempProfile({ ...tempProfile, profession: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Data de Nascimento</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="date" 
                        className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                        value={tempProfile.birthDate}
                        onChange={(e) => setTempProfile({ ...tempProfile, birthDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Localização</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        className="w-full pl-12 pr-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                        value={tempProfile.location}
                        onChange={(e) => setTempProfile({ ...tempProfile, location: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Bio / Objetivos</label>
                    <textarea 
                      rows={3}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium resize-none"
                      value={tempProfile.bio}
                      onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Notifications Section */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 font-display">Alertas de Contas Fixas</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-4">
                      Notificar-me sobre contas a vencer com antecedência de:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {availableDays.map((day) => (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={cn(
                            "px-4 py-2 rounded-xl border transition-all duration-200 font-medium",
                            alertDays.includes(day)
                              ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200"
                              : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
                          )}
                        >
                          {day} {day === 1 ? "dia" : "dias"}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-4 italic">
                      * Você receberá alertas no painel de "Contas Fixas" para cada período selecionado acima.
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 opacity-60">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 font-display">Segurança e Privacidade</h3>
                </div>
                <p className="text-slate-500 text-sm">Configurações de segurança em breve.</p>
              </div>
            </>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[40px] p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />
            
            <h4 className="font-bold text-lg mb-6 font-display tracking-wide opacity-60 uppercase text-xs">Perfil do Usuário</h4>
            
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-4">
                <img 
                  src={userProfile.photoUrl || "https://picsum.photos/seed/user/200/200"} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-[32px] object-cover border-4 border-white/10"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold font-display">{userProfile.name}</h3>
              <p className="text-emerald-400 text-sm font-medium mb-1">{userProfile.profession}</p>
              <div className="flex items-center gap-1 text-[10px] bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                Plano {userProfile.plan}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Globe className="w-4 h-4" />
                <span>{userProfile.location}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Palette className="w-4 h-4" />
                <span className="truncate">{userProfile.bio}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setTempProfile(userProfile);
                setIsEditingProfile(true);
              }}
              className="w-full py-4 bg-white text-slate-900 hover:bg-emerald-50 rounded-2xl text-sm font-bold transition-all active:scale-95"
            >
              Editar Perfil
            </button>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-6 font-display">Sobre o App</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Versão</span>
                <span className="font-bold text-slate-900 bg-slate-50 px-3 py-1 rounded-lg">2.4.0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Última Atualização</span>
                <span className="font-bold text-slate-900">27 Mar 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
